import { createClient } from '@/lib/supabase/client'
import type { ProgressoDia, Estatisticas, Configuracoes, Redemption } from '@/types/database'

// PROGRESSO
export async function salvarProgresso(dataId: string, progresso: ProgressoDia) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    // Verifica se já existe um progresso concluído para esta data
    const { data: progressoExistente } = await supabase
        .from('progresso')
        .select('concluido, first_completed_at')
        .eq('user_id', user.id)
        .eq('data_id', dataId)
        .single()

    // Só define first_completed_at se for a primeira vez que está sendo concluído
    const isFirstCompletion = progresso.concluido && (!progressoExistente || !progressoExistente.concluido)
    const firstCompletedAt = isFirstCompletion
        ? new Date().toISOString()
        : progressoExistente?.first_completed_at || null

    const { error } = await supabase
        .from('progresso')
        .upsert({
            user_id: user.id,
            data_id: dataId,
            concluido: progresso.concluido,
            auto_avaliacao: progresso.autoAvaliacao,
            questoes_acertadas: progresso.questoesAcertadas,
            questoes_total: progresso.questoesTotal,
            data_revisao: progresso.dataRevisao,
            anotacoes: progresso.anotacoes,
            first_completed_at: firstCompletedAt,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,data_id'
        })

    if (error) {
        console.error('Supabase upsert error:', error.message, error.code, error.details)
        throw error
    }

    // Atualiza estatísticas apenas se for primeira conclusão
    if (isFirstCompletion) {
        await atualizarEstatisticas()
    }
}

export async function getProgresso(dataId: string): Promise<ProgressoDia | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('data_id', dataId)
        .single()

    if (error || !data) return null

    return {
        dataId: data.data_id,
        concluido: data.concluido,
        autoAvaliacao: data.auto_avaliacao,
        questoesAcertadas: data.questoes_acertadas,
        questoesTotal: data.questoes_total,
        dataRevisao: data.data_revisao,
        anotacoes: data.anotacoes
    }
}

export async function getTodosProgressos(): Promise<Record<string, ProgressoDia>> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return {}

    const { data, error } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)

    if (error || !data) return {}

    const progressos: Record<string, ProgressoDia> = {}
    data.forEach(item => {
        progressos[item.data_id] = {
            dataId: item.data_id,
            concluido: item.concluido,
            autoAvaliacao: item.auto_avaliacao,
            questoesAcertadas: item.questoes_acertadas,
            questoesTotal: item.questoes_total,
            dataRevisao: item.data_revisao,
            anotacoes: item.anotacoes
        }
    })

    return progressos
}

// REVISÕES PENDENTES
export interface RevisaoPendente {
    dataId: string
    autoAvaliacao: 'preciso_revisar' | 'nao_entendi'
    dataRevisao: string
    questoesAcertadas: number
    questoesTotal: number
}

export async function getRevisoesPendentes(): Promise<RevisaoPendente[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Pegar data de hoje no fuso horário de São Paulo
    const hoje = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-')

    const { data, error } = await supabase
        .from('progresso')
        .select('data_id, auto_avaliacao, data_revisao, questoes_acertadas, questoes_total')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .not('data_revisao', 'is', null)
        .lte('data_revisao', hoje + 'T23:59:59')
        .in('auto_avaliacao', ['preciso_revisar', 'nao_entendi'])

    if (error || !data) return []

    return data.map(item => ({
        dataId: item.data_id,
        autoAvaliacao: item.auto_avaliacao as 'preciso_revisar' | 'nao_entendi',
        dataRevisao: item.data_revisao,
        questoesAcertadas: item.questoes_acertadas,
        questoesTotal: item.questoes_total
    }))
}

// ESTATÍSTICAS
export async function getEstatisticas(): Promise<Estatisticas> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const defaultStats: Estatisticas = {
        diasConcluidos: 0,
        streakAtual: 0,
        maiorStreak: 0,
        xpTotal: 0,
        saldo: 0
    }

    if (!user) return defaultStats

    const { data, error } = await supabase
        .from('estatisticas')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return defaultStats

    // Busca gastos com recompensas
    const { data: resgates } = await supabase
        .from('redemptions')
        .select('cost')
        .eq('user_id', user.id)

    const totalGasto = resgates?.reduce((acc, r) => acc + r.cost, 0) || 0

    return {
        diasConcluidos: data.dias_concluidos,
        streakAtual: data.streak_atual,
        maiorStreak: data.maior_streak,
        xpTotal: data.xp_total,
        saldo: data.xp_total - totalGasto,
        ultimoDiaEstudo: data.ultimo_dia_estudo
    }
}

export async function atualizarEstatisticas() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Busca todos os progressos concluídos
    const { data: progressos } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .not('first_completed_at', 'is', null)
        .order('first_completed_at', { ascending: false })

    // Busca provas finalizadas para contabilizar dias recuperados
    const { data: provasFinalizadas } = await supabase
        .from('provas_semanais')
        .select('semana, finalizada_em, nota')
        .eq('user_id', user.id)
        .eq('status', 'finalizada')

    // Pega dias únicos globais (para XP e Dias Concluídos)
    const diasUnicos = new Set<string>()
    // Pega dias de estudo REAL (para Streak - apenas dias que ela realmente estudou)
    const diasEstudoReal = new Set<string>()

    // Contadores de XP diferenciado
    let moedasEstudoNoPrazo = 0
    let moedasEstudoRecuperado = 0
    const diasEstudoNoPrazo = new Set<string>()

    progressos?.forEach(p => {
        if (p.first_completed_at) {
            const dataConclusao = new Date(p.first_completed_at)
            const dataConclusaoStr = `${dataConclusao.getFullYear()}-${String(dataConclusao.getMonth() + 1).padStart(2, '0')}-${String(dataConclusao.getDate()).padStart(2, '0')}`

            diasUnicos.add(p.data_id)

            // Se a data da lição for igual à data de conclusão, ganha 50
            if (p.data_id === dataConclusaoStr) {
                moedasEstudoNoPrazo += 50
                diasEstudoNoPrazo.add(p.data_id)
            } else {
                // Se foi feito depois, ganha 30
                moedasEstudoRecuperado += 30
            }
        }
    })

    // Contador de dias recuperados e bônus de provas
    let diasRecuperados = 0
    let xpBonusProvas = 0
    const domingosDasProvas = new Set<string>()

    // NOVO: Adiciona dias recuperados de provas atrasadas
    // Para cada prova finalizada, adiciona os dias entre o domingo da prova e a data de finalização
    const PRIMEIRO_DOMINGO = new Date('2025-12-14T12:00:00')

    provasFinalizadas?.forEach(prova => {
        if (prova.finalizada_em) {
            const domingoDaProva = new Date(PRIMEIRO_DOMINGO)
            domingoDaProva.setDate(domingoDaProva.getDate() + (prova.semana - 1) * 7)
            const domingoStr = `${domingoDaProva.getFullYear()}-${String(domingoDaProva.getMonth() + 1).padStart(2, '0')}-${String(domingoDaProva.getDate()).padStart(2, '0')}`

            domingosDasProvas.add(domingoStr)

            // Bônus de desempenho: Nota / 10 (Ex: 1000 nota = 100 moedas)
            xpBonusProvas += Math.floor((prova.nota || 0) / 10)

            const dataFinalizacao = new Date(prova.finalizada_em)

            if (dataFinalizacao > domingoDaProva) {
                // Domingo da prova conta para dias concluídos mas não para XP fixo de 30 (já ganha bônus de nota)
                if (!diasUnicos.has(domingoStr)) {
                    diasUnicos.add(domingoStr)
                }

                // Adiciona todos os dias entre o domingo+1 e a data de finalização
                const diaAtual = new Date(domingoDaProva)
                diaAtual.setDate(diaAtual.getDate() + 1) // Começa no dia seguinte ao domingo

                while (diaAtual <= dataFinalizacao) {
                    const diaStr = `${diaAtual.getFullYear()}-${String(diaAtual.getMonth() + 1).padStart(2, '0')}-${String(diaAtual.getDate()).padStart(2, '0')}`
                    if (!diasUnicos.has(diaStr)) {
                        diasUnicos.add(diaStr)
                        diasRecuperados++
                    }
                    diaAtual.setDate(diaAtual.getDate() + 1)
                }
            } else {
                // Prova foi feita no próprio domingo
                if (!diasUnicos.has(domingoStr)) {
                    diasUnicos.add(domingoStr)
                }
            }
        }
    })

    if (diasUnicos.size === 0) {
        // Sem progressos, zera tudo
        await supabase
            .from('estatisticas')
            .upsert({
                user_id: user.id,
                dias_concluidos: 0,
                streak_atual: 0,
                maior_streak: 0,
                xp_total: 0,
                ultimo_dia_estudo: null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
        return
    }

    const diasConcluidos = diasUnicos.size
    const xpTotal = moedasEstudoNoPrazo + moedasEstudoRecuperado + (diasRecuperados * 30) + xpBonusProvas

    // Ordena os dias de estudo do mais recente ao mais antigo

    // Ordena os dias de estudo REAL (NO PRAZO) para cálculo do streak
    const diasOrdenadosStreak = Array.from(diasEstudoNoPrazo).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    // Calcula ultimo dia de estudo (considerando recuperados também para exibição geral, mas streak é estrito)
    // Na verdade, ultimo dia de estudo costuma ser o gatilho do streak, mas se o streak é só real, usamos o real.
    const ultimoDiaEstudo = diasOrdenadosStreak[0] || null

    // Calcula streak baseado em dias consecutivos de atividade REAL
    let streakAtual = 0
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    // Ontem
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const ontemStr = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`

    // O streak só está ativo se estudou HOJE ou ONTEM (Estudo REAL)
    const estudouHoje = ultimoDiaEstudo === hojeStr
    const estudouOntem = ultimoDiaEstudo === ontemStr

    if ((estudouHoje || estudouOntem) && diasOrdenadosStreak.length > 0) {
        // Streak está vivo, conta dias consecutivos
        streakAtual = 1
        let dataAtual = new Date(diasOrdenadosStreak[0])
        dataAtual.setHours(0, 0, 0, 0)

        for (let i = 1; i < diasOrdenadosStreak.length; i++) {
            const dataAnterior = new Date(diasOrdenadosStreak[i])
            dataAnterior.setHours(0, 0, 0, 0)

            const diffTime = dataAtual.getTime() - dataAnterior.getTime()
            const diffDays = diffTime / (1000 * 60 * 60 * 24)

            if (diffDays === 1) {
                // Dia consecutivo
                streakAtual++
                dataAtual = dataAnterior
            } else {
                // Quebra na sequência
                break
            }
        }
    } else {
        // Mais de 24h sem estudar REALMENTE, streak zera
        streakAtual = 0
    }

    // Busca maior streak anterior
    const { data: statsExistente } = await supabase
        .from('estatisticas')
        .select('maior_streak')
        .eq('user_id', user.id)
        .single()

    const maiorStreak = Math.max(streakAtual, statsExistente?.maior_streak || 0)

    await supabase
        .from('estatisticas')
        .upsert({
            user_id: user.id,
            dias_concluidos: diasConcluidos,
            streak_atual: streakAtual,
            maior_streak: maiorStreak,
            xp_total: xpTotal,
            ultimo_dia_estudo: ultimoDiaEstudo,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
}

// CONFIGURAÇÕES
export async function getConfiguracoes(): Promise<Configuracoes> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const defaultConfig: Configuracoes = {
        modoEscuro: false,
        notificacoes: true,
        metaDiaria: 60
    }

    if (!user) return defaultConfig

    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return defaultConfig

    return {
        modoEscuro: data.modo_escuro,
        notificacoes: data.notificacoes,
        metaDiaria: data.meta_diaria
    }
}

export async function salvarConfiguracoes(config: Configuracoes) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
        .from('configuracoes')
        .upsert({
            user_id: user.id,
            modo_escuro: config.modoEscuro,
            notificacoes: config.notificacoes,
            meta_diaria: config.metaDiaria,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })

    if (error) throw error
}

// RECOMPENSAS
export async function getResgates(): Promise<Redemption[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false })

    if (error || !data) return []

    return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        rewardId: item.reward_id,
        rewardTitle: item.reward_title,
        cost: item.cost,
        redeemedAt: item.redeemed_at,
        usedAt: item.used_at
    }))
}

export async function salvarResgate(reward: { id: string, title: string, cost: number }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
        .from('redemptions')
        .insert({
            user_id: user.id,
            reward_id: reward.id,
            reward_title: reward.title,
            cost: reward.cost
        })

    if (error) throw error
}

export async function usarVale(redemptionId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
        .from('redemptions')
        .update({ used_at: new Date().toISOString() })
        .eq('id', redemptionId)
        .eq('user_id', user.id)

    if (error) throw error
}

// EXTRATO
export interface ExtratoItem {
    id: string
    tipo: 'ganho' | 'gasto'
    descricao: string
    valor: number
    data: string
}

export async function getExtrato(): Promise<ExtratoItem[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Buscar ganhos (dias concluídos)
    // Precisamos buscar o conteúdo também para saber o nome da tarefa
    // Como o conteúdo é estático (json), pegamos apenas o data_id e cruzamos depois no front?
    // Melhor: retornar algo genérico como "Dia Concluído" e a data, se não tivermos acesso fácil ao JSON aqui.
    // Mas podemos importar o JSON aqui se necessário, ou apenas retornar o ID e o front resolve o nome.
    // Simplificação v1: "Dia de Estudo Concluído"

    const { data: progressos } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .not('first_completed_at', 'is', null)

    const ganhos: ExtratoItem[] = (progressos || []).map(p => {
        const dataConclusao = new Date(p.first_completed_at!)
        const dataConclusaoStr = `${dataConclusao.getFullYear()}-${String(dataConclusao.getMonth() + 1).padStart(2, '0')}-${String(dataConclusao.getDate()).padStart(2, '0')}`

        const noPrazo = p.data_id === dataConclusaoStr

        return {
            id: `ganho-${p.data_id}`,
            tipo: 'ganho' as const,
            descricao: noPrazo ? 'Dia Concluído (No Prazo)' : 'Dia Recuperado',
            valor: noPrazo ? 50 : 30,
            data: p.first_completed_at!
        }
    })

    // 2. Buscar provas finalizadas para dias recuperados
    const { data: provasFinalizadas } = await supabase
        .from('provas_semanais')
        .select('semana, finalizada_em, nota')
        .eq('user_id', user.id)
        .eq('status', 'finalizada')

    const diasUnicos = new Set<string>()
    progressos?.forEach(p => {
        if (p.first_completed_at) {
            const dataEstudo = new Date(p.first_completed_at)
            const diaStr = `${dataEstudo.getFullYear()}-${String(dataEstudo.getMonth() + 1).padStart(2, '0')}-${String(dataEstudo.getDate()).padStart(2, '0')}`
            diasUnicos.add(diaStr)
        }
    })

    const PRIMEIRO_DOMINGO = new Date('2025-12-14T12:00:00')
    const diasRecuperados: { data: string, origem: string }[] = []

    provasFinalizadas?.forEach(prova => {
        if (prova.finalizada_em) {
            const domingoDaProva = new Date(PRIMEIRO_DOMINGO)
            domingoDaProva.setDate(domingoDaProva.getDate() + (prova.semana - 1) * 7)
            const dataFinalizacao = new Date(prova.finalizada_em)

            if (dataFinalizacao > domingoDaProva) {
                // Domingo da prova
                const domingoStr = `${domingoDaProva.getFullYear()}-${String(domingoDaProva.getMonth() + 1).padStart(2, '0')}-${String(domingoDaProva.getDate()).padStart(2, '0')}`
                if (!diasUnicos.has(domingoStr)) {
                    diasRecuperados.push({ data: domingoDaProva.toISOString(), origem: `Prova Semanal ${prova.semana}` })
                    diasUnicos.add(domingoStr)
                }

                // Dias entre domingo e finalização
                const diaAtual = new Date(domingoDaProva)
                diaAtual.setDate(diaAtual.getDate() + 1)

                while (diaAtual <= dataFinalizacao) {
                    const diaStr = `${diaAtual.getFullYear()}-${String(diaAtual.getMonth() + 1).padStart(2, '0')}-${String(diaAtual.getDate()).padStart(2, '0')}`
                    if (!diasUnicos.has(diaStr)) {
                        diasRecuperados.push({ data: diaAtual.toISOString(), origem: `Recuperado (Prova ${prova.semana})` })
                        diasUnicos.add(diaStr)
                    }
                    diaAtual.setDate(diaAtual.getDate() + 1)
                }
            } else {
                const domingoStr = `${domingoDaProva.getFullYear()}-${String(domingoDaProva.getMonth() + 1).padStart(2, '0')}-${String(domingoDaProva.getDate()).padStart(2, '0')}`
                if (!diasUnicos.has(domingoStr)) {
                    diasRecuperados.push({ data: domingoDaProva.toISOString(), origem: `Prova Semanal ${prova.semana}` })
                    diasUnicos.add(domingoStr)
                }
            }
        }
    })

    const ganhosRecuperados: ExtratoItem[] = diasRecuperados.map((d, index) => ({
        id: `recuperado-${index}-${d.data}`,
        tipo: 'ganho',
        descricao: d.origem,
        valor: 30, // Dias recuperados valem 30 moedas (vs 50 de dias normais)
        data: d.data
    }))

    // 2.5 Bônus das Provas no Extrato
    const ganhosProvas: ExtratoItem[] = (provasFinalizadas || []).map(p => ({
        id: `prova-bonus-${p.semana}`,
        tipo: 'ganho' as const,
        descricao: `Bônus de Desempenho (Semana ${p.semana})`,
        valor: Math.floor(((p as any).nota || 0) / 10),
        data: p.finalizada_em!
    })).filter(p => p.valor > 0)

    // 3. Buscar gastos (resgates)
    const { data: resgates } = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', user.id)

    const gastos: ExtratoItem[] = (resgates || []).map(r => ({
        id: r.id,
        tipo: 'gasto',
        descricao: `Resgate: ${r.reward_title}`,
        valor: r.cost,
        data: r.redeemed_at
    }))

    // 4. Unificar e Ordenar
    const extrato = [...ganhos, ...ganhosRecuperados, ...ganhosProvas, ...gastos].sort((a, b) =>
        new Date(b.data).getTime() - new Date(a.data).getTime()
    )

    return extrato
}
