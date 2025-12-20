import { createClient } from '@/lib/supabase/client'
import type { ProgressoDia, Estatisticas, Configuracoes } from '@/types/database'

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

// ESTATÍSTICAS
export async function getEstatisticas(): Promise<Estatisticas> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const defaultStats: Estatisticas = {
        diasConcluidos: 0,
        streakAtual: 0,
        maiorStreak: 0,
        xpTotal: 0
    }

    if (!user) return defaultStats

    const { data, error } = await supabase
        .from('estatisticas')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return defaultStats

    return {
        diasConcluidos: data.dias_concluidos,
        streakAtual: data.streak_atual,
        maiorStreak: data.maior_streak,
        xpTotal: data.xp_total,
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
        .select('semana, finalizada_em')
        .eq('user_id', user.id)
        .eq('status', 'finalizada')

    // Pega dias únicos em que houve estudo (baseado em first_completed_at)
    const diasUnicos = new Set<string>()

    // Adiciona dias de estudo normal
    progressos?.forEach(p => {
        if (p.first_completed_at) {
            const dataEstudo = new Date(p.first_completed_at)
            const diaStr = `${dataEstudo.getFullYear()}-${String(dataEstudo.getMonth() + 1).padStart(2, '0')}-${String(dataEstudo.getDate()).padStart(2, '0')}`
            diasUnicos.add(diaStr)
        }
    })

    // NOVO: Adiciona dias recuperados de provas atrasadas
    // Para cada prova finalizada, adiciona os dias entre o domingo da prova e a data de finalização
    const PRIMEIRO_DOMINGO = new Date('2025-12-14T12:00:00')

    provasFinalizadas?.forEach(prova => {
        if (prova.finalizada_em) {
            // Calcular o domingo da semana dessa prova
            const domingoDaProva = new Date(PRIMEIRO_DOMINGO)
            domingoDaProva.setDate(domingoDaProva.getDate() + (prova.semana - 1) * 7)

            const dataFinalizacao = new Date(prova.finalizada_em)

            // Verificar se a prova foi feita após o domingo (atrasada)
            if (dataFinalizacao > domingoDaProva) {
                // Adiciona o dia da prova (domingo)
                const domingoStr = `${domingoDaProva.getFullYear()}-${String(domingoDaProva.getMonth() + 1).padStart(2, '0')}-${String(domingoDaProva.getDate()).padStart(2, '0')}`
                diasUnicos.add(domingoStr)

                // Adiciona todos os dias entre o domingo+1 e a data de finalização
                const diaAtual = new Date(domingoDaProva)
                diaAtual.setDate(diaAtual.getDate() + 1) // Começa no dia seguinte ao domingo

                while (diaAtual <= dataFinalizacao) {
                    const diaStr = `${diaAtual.getFullYear()}-${String(diaAtual.getMonth() + 1).padStart(2, '0')}-${String(diaAtual.getDate()).padStart(2, '0')}`
                    diasUnicos.add(diaStr)
                    diaAtual.setDate(diaAtual.getDate() + 1)
                }
            } else {
                // Prova foi feita no próprio domingo - só adiciona o domingo
                const domingoStr = `${domingoDaProva.getFullYear()}-${String(domingoDaProva.getMonth() + 1).padStart(2, '0')}-${String(domingoDaProva.getDate()).padStart(2, '0')}`
                diasUnicos.add(domingoStr)
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
    const xpTotal = diasConcluidos * 50 // 50 XP por dia único

    // Ordena os dias de estudo do mais recente ao mais antigo
    const diasOrdenados = Array.from(diasUnicos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    // Calcula streak baseado em dias consecutivos de atividade
    let streakAtual = 0
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    // Ontem
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const ontemStr = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`

    // O streak só está ativo se estudou HOJE ou ONTEM
    const ultimoDiaEstudo = diasOrdenados[0]
    const estudouHoje = ultimoDiaEstudo === hojeStr
    const estudouOntem = ultimoDiaEstudo === ontemStr

    if (estudouHoje || estudouOntem) {
        // Streak está vivo, conta dias consecutivos
        streakAtual = 1
        let dataAtual = new Date(diasOrdenados[0])
        dataAtual.setHours(0, 0, 0, 0)

        for (let i = 1; i < diasOrdenados.length; i++) {
            const dataAnterior = new Date(diasOrdenados[i])
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
        // Mais de 24h sem estudar, streak zera
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
