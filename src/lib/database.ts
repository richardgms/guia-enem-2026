import { createClient } from '@/lib/supabase/client'
import type { ProgressoDia, Estatisticas, Configuracoes } from '@/types/database'

// PROGRESSO
export async function salvarProgresso(dataId: string, progresso: ProgressoDia) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

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
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,data_id'
        })

    if (error) throw error

    // Atualiza estatísticas
    await atualizarEstatisticas()
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

async function atualizarEstatisticas() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Busca todos os progressos para calcular estatísticas
    const { data: progressos } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .order('data_id', { ascending: false })

    if (!progressos) return

    const diasConcluidos = progressos.length
    const xpTotal = diasConcluidos * 50 // 50 XP por dia

    // Calcula streak
    let streakAtual = 0
    // Ordena progressos por data decrescente
    const datasConcluidas = progressos.map(p => p.data_id).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (datasConcluidas.length > 0) {
        const hoje = new Date()
        // Normaliza para meia-noite para comparação de dias apenas
        hoje.setHours(0, 0, 0, 0);

        const ultimaData = new Date(datasConcluidas[0])
        ultimaData.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(hoje.getTime() - ultimaData.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Se estudou hoje ou ontem, o streak está vivo
        if (diffDays <= 1) {
            streakAtual = 1
            let currentDate = ultimaData

            for (let i = 1; i < datasConcluidas.length; i++) {
                const prevDate = new Date(datasConcluidas[i])
                prevDate.setHours(0, 0, 0, 0);

                const diffStreak = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDaysStreak = Math.ceil(diffStreak / (1000 * 60 * 60 * 24));

                if (diffDaysStreak === 1) {
                    streakAtual++
                    currentDate = prevDate
                } else {
                    break
                }
            }
        } else {
            streakAtual = 0
        }
    }

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
            ultimo_dia_estudo: progressos[0]?.data_id || null,
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
