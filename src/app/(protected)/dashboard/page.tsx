import { createClient } from "@/lib/supabase/server"
import { Streak } from "@/components/Streak"
import { StatusFeedback } from "@/components/StatusFeedback"
import { TaskBadge } from "@/components/TaskBadge"
import conteudosData from "@/data/conteudos.json"
import {
    getHojeBrasil,
    calcularHistoricoPresenca,
    gerarStatsPresenca,
    calcularStatusEstudante,
    getTarefaPrioritaria,
    podeConcluirTarefa,
    formatarDataExibicao
} from "@/lib/studyProgress"
import { calcularSemanaAtual, getDomingoDaSemana, SEMANAS_COM_PROVA } from "@/lib/provaUtils"

import Link from "next/link"
import type { ConteudoDia } from "@/types"
import { MotivationalQuotes } from "@/components/MotivationalQuotes"

export const dynamic = 'force-dynamic'

// Helper for display names
const getMateriaLabel = (materia: string) => {
    const labels: Record<string, string> = {
        'matematica': 'Matemática',
        'portugues': 'Português',
        'biologia': 'Biologia',
        'historia': 'História',
        'fisica': 'Física',
        'quimica': 'Química',
        'geografia': 'Geografia',
        'redacao': 'Redação',
        'revisao': 'Revisão'
    }
    return labels[materia] || materia
}

// Helper for tag styles
const getTagStyle = (materia: string) => {
    switch (materia) {
        case 'matematica': return 'bg-blue-100 text-blue-700'
        case 'portugues': return 'bg-purple-100 text-purple-700'
        case 'biologia': return 'bg-cyan-100 text-cyan-700'
        case 'historia': return 'bg-red-100 text-red-700'
        case 'redacao': return 'bg-pink-100 text-pink-700'
        case 'revisao': return 'bg-slate-100 text-slate-700'
        case 'fisica': return 'bg-orange-100 text-orange-700'
        case 'quimica': return 'bg-green-100 text-green-700'
        case 'geografia': return 'bg-lime-100 text-lime-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Buscar estatísticas direto do banco (server-side)
    let stats = {
        diasConcluidos: 0,
        streakAtual: 0,
        maiorStreak: 0,
        xpTotal: 0,
        saldo: 0
    }

    if (user) {
        const { data: statsDB } = await supabase
            .from('estatisticas')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (statsDB) {
            // Buscar gastos
            const { data: resgates } = await supabase
                .from('redemptions')
                .select('cost')
                .eq('user_id', user.id)

            const totalGasto = resgates?.reduce((acc: number, r: { cost: number }) => acc + r.cost, 0) || 0

            stats = {
                diasConcluidos: statsDB.dias_concluidos || 0,
                streakAtual: statsDB.streak_atual || 0,
                maiorStreak: statsDB.maior_streak || 0,
                xpTotal: statsDB.xp_total || 0,
                saldo: (statsDB.xp_total || 0) - totalGasto
            }
        }
    }

    // 1. Buscar todos os progressos
    const progressos: Record<string, { concluido: boolean, first_completed_at?: string }> = {}
    if (user) {
        const { data: progressoDB } = await supabase
            .from('progresso')
            .select('data_id, concluido, first_completed_at')
            .eq('user_id', user.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progressoDB?.forEach((p: any) => {
            progressos[p.data_id] = {
                concluido: p.concluido,
                first_completed_at: p.first_completed_at
            }
        })
    }

    // 2. Buscar provas semanais finalizadas
    let provasRealizadasDB = null
    if (user) {
        const { data } = await supabase
            .from('provas_semanais')
            .select('semana, finalizada_em')
            .eq('user_id', user.id)
            .eq('status', 'finalizada')
        provasRealizadasDB = data
    }

    // 2.5 Buscar revisões pendentes (sem filtro de data)
    let revisoesPendentesCount = 0
    if (user) {
        const { count } = await supabase
            .from('progresso')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('concluido', true)
            .in('auto_avaliacao', ['preciso_revisar', 'nao_entendi'])
        revisoesPendentesCount = count || 0
    }

    const provasRealizadas = (provasRealizadasDB || []).map(p => ({
        semana: p.semana,
        finalizada_em: p.finalizada_em
    }))

    // 3. Buscar conteúdos
    const conteudos = conteudosData.conteudos as ConteudoDia[]
    const hoje = getHojeBrasil()

    // 4. Calcular métricas de presença dinamicamente
    const historicoPresenca = calcularHistoricoPresenca(conteudos, progressos, provasRealizadas, hoje)
    const presencaStats = gerarStatsPresenca(historicoPresenca)

    // ===== VERIFICAR PROVA ATRASADA =====
    let provaAtrasada: { semana: number; diasAtraso: number } | null = null
    if (user) {
        const agora = new Date()
        const semanasFeitas = new Set(provasRealizadas.map(p => p.semana))

        // Verificar cada semana com prova
        for (const s of SEMANAS_COM_PROVA) {
            const domingoDaSemana = getDomingoDaSemana(s)
            const passou = agora > domingoDaSemana

            if (passou && !semanasFeitas.has(s)) {
                const diffMs = agora.getTime() - domingoDaSemana.getTime()
                const diasAtraso = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                provaAtrasada = { semana: s, diasAtraso }
                break
            }
        }
    }

    // Calcular progresso geral
    const totalDias = conteudos.length
    const diasConcluidos = stats.diasConcluidos

    // ===== NOVA LÓGICA DE PRIORIZAÇÃO =====
    // Calcular status do estudante
    const analiseEstudante = calcularStatusEstudante(conteudos, progressos, hoje)

    // Obter tarefa prioritária
    const tarefaPrioritaria = getTarefaPrioritaria(conteudos, progressos, hoje)

    // Encontrar índice da tarefa prioritária para exibir "Dia X de Y"
    const tarefaPrioritariaIndex = tarefaPrioritaria
        ? conteudos.findIndex(c => c.id === tarefaPrioritaria.id)
        : 0

    // Determinar tipo de badge para a tarefa prioritária
    const getTipoTarefaPrioritaria = (): 'atrasado' | 'hoje' | 'adiantado' | null => {
        if (!tarefaPrioritaria) return null
        if (analiseEstudante.tarefasAtrasadas.some(t => t.id === tarefaPrioritaria.id)) {
            return 'atrasado'
        }
        if (tarefaPrioritaria.data === hoje) {
            return 'hoje'
        }
        return null
    }

    // Próximos dias (excluindo a tarefa prioritária)
    const getProximosDiasParaExibir = () => {
        if (!tarefaPrioritaria) return []

        const tarefaIndex = conteudos.findIndex(c => c.id === tarefaPrioritaria.id)
        const proximosDias: ConteudoDia[] = []

        // Pegar os próximos 3 após a tarefa prioritária
        for (let i = tarefaIndex + 1; i < conteudos.length && proximosDias.length < 3; i++) {
            proximosDias.push(conteudos[i])
        }

        return proximosDias
    }

    const nextDays = getProximosDiasParaExibir()

    // Buscar perfil do usuário
    let nomeUsuario = user?.email?.split('@')[0] || "Visitante"
    let avatarEmoji = "👋"

    if (user) {
        const { data: perfil } = await supabase
            .from('perfil')
            .select('nome, avatar_emoji')
            .eq('user_id', user.id)
            .single()

        if (perfil?.nome) {
            nomeUsuario = perfil.nome
            avatarEmoji = perfil.avatar_emoji || "👋"
        }
    }

    // Verificar se a tarefa prioritária pode ser iniciada
    const permissaoTarefa = tarefaPrioritaria
        ? podeConcluirTarefa(tarefaPrioritaria, hoje)
        : { permitido: true }

    return (
        <div className="relative min-h-screen" id="dashboard-container">
            <div className="p-6 lg:p-8 relative z-10">
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Welcome Section */}
                        <section aria-labelledby="welcome-heading">
                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl font-normal text-primary" id="welcome-heading">
                                    Olá, <span className="font-bold">{nomeUsuario}!</span> {avatarEmoji}
                                </h1>
                                <Link href="/perfil" className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1 p-2 -mr-2" title="Editar perfil">
                                    <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>edit</span>
                                    <span className="hidden md:inline">Editar perfil</span>
                                </Link>
                            </div>
                            <p className="text-text-secondary mt-2">
                                Pronto para dominar o ENEM 2026? Vamos lá!
                            </p>
                            {/* Status Feedback */}
                            {(() => {
                                // Calcular número de provas atrasadas
                                const semanasFeitas = new Set(provasRealizadas.map(p => p.semana))
                                let provasAtrasadasCount = 0
                                const agora = new Date()
                                for (const s of SEMANAS_COM_PROVA) {
                                    const domingo = getDomingoDaSemana(s)
                                    if (agora > domingo && !semanasFeitas.has(s)) {
                                        provasAtrasadasCount++
                                    }
                                }
                                const totalAtrasados = analiseEstudante.diasAtrasados + provasAtrasadasCount
                                const statusFinal = totalAtrasados > 0 ? 'atrasado' : analiseEstudante.status

                                return (
                                    <StatusFeedback
                                        status={statusFinal}
                                        diasAtrasados={totalAtrasados}
                                        diasAdiantados={analiseEstudante.diasAdiantados}
                                    />
                                )
                            })()}
                        </section>

                        {/* Today Focus Section */}
                        <section aria-labelledby="today-focus-heading">
                            <div className="flex justify-between items-baseline mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-semibold" id="today-focus-heading">Seu foco de hoje</h2>
                                    {provaAtrasada ? (
                                        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                            Prova Atrasada
                                        </span>
                                    ) : (
                                        <TaskBadge tipo={getTipoTarefaPrioritaria()} />
                                    )}
                                </div>
                                {!provaAtrasada && (
                                    <span className="text-sm text-text-secondary font-medium">Dia {tarefaPrioritariaIndex + 1} de {totalDias}</span>
                                )}
                            </div>

                            {/* PROVA ATRASADA - PRIORIDADE MÁXIMA */}
                            {provaAtrasada ? (
                                <div className="bg-red-50 shadow-custom rounded-2xl p-6 border-2 border-red-200 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden gap-4">
                                    <div className="border-l-4 border-red-500 pl-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">⚠️</span>
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                {provaAtrasada.diasAtraso} {provaAtrasada.diasAtraso === 1 ? 'dia' : 'dias'} atrasado
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold mt-2 text-red-700">Prova Semanal - Semana {provaAtrasada.semana}</h3>
                                        <div className="flex items-center space-x-3 mt-3 text-sm flex-wrap gap-y-2">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                                                📝 25 questões
                                            </span>
                                            <span className="flex items-center text-red-600 font-medium">
                                                <span className="material-symbols-outlined text-base mr-1.5" style={{ fontFamily: 'Material Symbols Outlined' }}>timer</span>
                                                50 minutos
                                            </span>
                                        </div>
                                    </div>

                                    <Link href="/prova" className="w-full md:w-auto">
                                        <button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-colors h-auto">
                                            <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                                                edit_note
                                            </span>
                                            <span>Fazer Prova Agora</span>
                                        </button>
                                    </Link>
                                </div>
                            ) : tarefaPrioritaria ? (
                                <div className={`${analiseEstudante.status === 'atrasado' ? 'bg-red-50 border-red-200' : 'bg-accent-green-bg'} shadow-custom rounded-2xl p-6 border border-card-border flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden gap-4`}>
                                    <div className={`border-l-4 ${analiseEstudante.status === 'atrasado' ? 'border-red-500' : 'border-accent-green-button'} pl-4`}>
                                        <p className="text-sm text-text-secondary capitalize">
                                            {formatarDataExibicao(tarefaPrioritaria.data)}
                                        </p>
                                        <h3 className="text-2xl font-bold mt-1 text-primary">{tarefaPrioritaria.assunto}</h3>
                                        <div className="flex items-center space-x-3 mt-3 text-sm flex-wrap gap-y-2">
                                            <span className={`${getTagStyle(tarefaPrioritaria.materia)} px-3 py-1 rounded-full font-medium capitalize`}>
                                                {getMateriaLabel(tarefaPrioritaria.materia)}
                                            </span>
                                            <span className="bg-tag-easy-bg text-tag-easy-text px-3 py-1 rounded-full font-medium">
                                                Essencial
                                            </span>
                                            <span className="flex items-center text-text-secondary font-medium">
                                                <span className="material-symbols-outlined text-base mr-1.5" style={{ fontFamily: 'Material Symbols Outlined' }}>timer</span>
                                                {tarefaPrioritaria.tempoEstimado}
                                            </span>
                                        </div>
                                    </div>

                                    {permissaoTarefa.permitido ? (
                                        <Link href={`/dia/${tarefaPrioritaria.data}`} className="w-full md:w-auto">
                                            <button className={`w-full md:w-auto ${progressos[tarefaPrioritaria.data]?.concluido ? 'bg-green-600' : analiseEstudante.status === 'atrasado' ? 'bg-red-600' : 'bg-accent-green-button'} text-white font-semibold px-4 py-2 rounded-full flex items-center justify-center space-x-2 hover:opacity-90 transition-colors h-auto`}>
                                                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                                                    {progressos[tarefaPrioritaria.data]?.concluido ? 'check' : 'play_arrow'}
                                                </span>
                                                <span>
                                                    {progressos[tarefaPrioritaria.data]?.concluido ? 'Concluído' : analiseEstudante.status === 'atrasado' ? 'Recuperar' : 'Começar'}
                                                </span>
                                            </button>
                                        </Link>
                                    ) : (
                                        <div className="w-full md:w-auto text-center">
                                            <button
                                                disabled
                                                className="w-full md:w-auto bg-slate-300 text-slate-600 font-semibold px-4 py-2 rounded-full flex items-center justify-center space-x-2 cursor-not-allowed h-auto"
                                            >
                                                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                                                    lock
                                                </span>
                                                <span>Bloqueado</span>
                                            </button>
                                            <p className="text-xs text-slate-500 mt-2 max-w-48">{permissaoTarefa.motivo}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-accent-green-bg shadow-custom rounded-2xl p-8 border border-card-border text-center">
                                    <h3 className="text-2xl font-bold text-accent-green-text">Parabéns! 🎉</h3>
                                    <p className="text-text-secondary mt-2">Você completou todo o cronograma!</p>
                                </div>
                            )}
                        </section>

                        {/* Next Steps Section */}
                        <section aria-labelledby="next-steps-heading">
                            <h2 className="text-2xl font-semibold mb-4" id="next-steps-heading">Próximos passos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {nextDays.map((day) => {
                                    // Format: "10/12 - Quarta-feira"
                                    const dateObj = new Date(day.data + 'T12:00:00') // prevent timezone offset issues
                                    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                    const weekdayCap = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })
                                    const isCompleted = progressos[day.data]?.concluido
                                    const permissao = podeConcluirTarefa(day, hoje)
                                    const isRevisaoBloqueada = !permissao.permitido

                                    return (
                                        <Link
                                            href={isRevisaoBloqueada ? '#' : `/dia/${day.data}`}
                                            key={day.data}
                                            className={`block group h-full ${isRevisaoBloqueada ? 'cursor-not-allowed' : ''}`}
                                            onClick={isRevisaoBloqueada ? (e) => e.preventDefault() : undefined}
                                        >
                                            <div className={`bg-white shadow-custom rounded-2xl p-4 border border-card-border ${isRevisaoBloqueada ? 'opacity-60' : 'hover:shadow-lg group-hover:border-primary/20'} transition-all relative h-full flex flex-col justify-between`}>
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-sm text-text-secondary font-medium ${!isRevisaoBloqueada ? 'group-hover:text-primary' : ''} transition-colors capitalize`}>
                                                            {dateStr} - {weekdayCap}
                                                        </p>
                                                        {isCompleted && (
                                                            <div className="text-green-500 z-10 -mt-1 -mr-1">
                                                                <span className="material-symbols-outlined text-2xl" style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                            </div>
                                                        )}
                                                        {isRevisaoBloqueada && !isCompleted && (
                                                            <div className="text-slate-400 z-10 -mt-1 -mr-1">
                                                                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>lock</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <h3 className={`font-bold mt-1 text-lg text-[#082F49] leading-tight ${!isRevisaoBloqueada ? 'group-hover:text-accent-green-button' : ''} transition-colors`}>
                                                        {day.assunto}
                                                    </h3>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className={`${getTagStyle(day.materia)} px-3 py-1 rounded-full font-bold text-xs capitalize inline-block`}>
                                                        {getMateriaLabel(day.materia)}
                                                    </span>
                                                    {isRevisaoBloqueada && (
                                                        <span className="text-xs text-slate-500">Só no dia</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                                {nextDays.length === 0 && (
                                    <p className="text-text-secondary text-sm col-span-3 text-center py-8 bg-white rounded-xl border">
                                        Sem mais atividades previstas.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Statistics Section */}
                        <section aria-labelledby="stats-heading">
                            <h2 className="text-2xl font-semibold mb-4 text-[#082F49]" id="stats-heading">Estatísticas</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Progress Card */}
                                <div className="bg-white shadow-custom rounded-2xl p-6 border border-card-border h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="material-symbols-outlined text-2xl text-slate-500" style={{ fontFamily: 'Material Symbols Outlined' }}>monitoring</span>
                                                <h3 className="font-semibold text-lg text-primary">Progresso Geral</h3>
                                            </div>
                                            <span className="font-bold text-lg text-primary">{Math.round((diasConcluidos / totalDias) * 100) || 0}%</span>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-3">Cronograma completo</p>

                                        <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                            <div className="bg-gradient-to-r from-cyan-400 to-sky-500 h-3 rounded-full" style={{ width: `${Math.round((diasConcluidos / totalDias) * 100) || 0}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                            <p className="font-bold text-3xl text-primary mb-1">{diasConcluidos}</p>
                                            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Concluídos</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                            <p className="font-bold text-3xl text-primary mb-1">{totalDias - diasConcluidos}</p>
                                            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Restantes</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Presença Card */}
                                <Link href="/presenca" className="block h-full group">
                                    <div className="bg-white shadow-custom rounded-2xl p-6 border border-card-border h-full flex flex-col justify-between group-hover:shadow-lg transition-all group-hover:border-primary/20">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="material-symbols-outlined text-2xl text-slate-500" style={{ fontFamily: 'Material Symbols Outlined' }}>event_available</span>
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-primary">Presença</h3>
                                                        <p className="text-[10px] text-text-secondary -mt-0.5 font-medium">(Hoje: 1.0 • Recup.: 0.5)</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-lg text-primary">{presencaStats.taxa}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full" style={{ width: `${presencaStats.taxa}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                                                <p className="font-bold text-2xl text-green-600 mb-1">{presencaStats.presencas}</p>
                                                <p className="text-[10px] font-bold text-green-700 uppercase">Presente</p>
                                            </div>
                                            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                                                <p className="font-bold text-2xl text-amber-600 mb-1">{presencaStats.atrasados}</p>
                                                <p className="text-[10px] font-bold text-amber-700 uppercase">Recup.</p>
                                            </div>
                                            <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                                                <p className="font-bold text-2xl text-red-600 mb-1">{presencaStats.faltas}</p>
                                                <p className="text-[10px] font-bold text-red-700 uppercase">Falta</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Motivational Quotes Card */}
                        <MotivationalQuotes nomeUsuario={nomeUsuario} />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white shadow-custom rounded-2xl p-4 border border-card-border flex items-center space-x-4">
                                <span className="material-symbols-outlined text-3xl text-slate-500" style={{ fontFamily: 'Material Symbols Outlined' }}>military_tech</span>
                                <div>
                                    <p className="text-xs text-text-secondary font-medium">NÍVEL</p>
                                    <p className="font-bold text-lg text-primary">Iniciante</p>
                                </div>
                            </div>
                            <div className="bg-white shadow-custom rounded-2xl p-4 border border-card-border flex items-center space-x-4">
                                <span className="material-symbols-outlined text-3xl text-yellow-500" style={{ fontFamily: 'Material Symbols Outlined' }}>paid</span>
                                <div>
                                    <p className="text-xs text-text-secondary font-medium">MOEDAS</p>
                                    <p className="font-bold text-lg text-primary">{stats.saldo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Streak Card */}
                        <Streak dias={stats.streakAtual} maiorStreak={stats.maiorStreak} />

                        {/* Card de Revisões Pendentes */}
                        {revisoesPendentesCount > 0 && (
                            <Link href="/revisoes" className="block group">
                                <div className="bg-amber-50 shadow-custom rounded-2xl p-5 border border-amber-200 hover:shadow-lg transition-all hover:border-amber-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2 rounded-full">
                                                <span className="material-symbols-outlined text-2xl text-amber-600" style={{ fontFamily: 'Material Symbols Outlined' }}>auto_stories</span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-amber-700 font-medium">Revisões Pendentes</p>
                                                <p className="text-2xl font-bold text-amber-800">{revisoesPendentesCount}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-amber-400 group-hover:text-amber-600 transition-colors" style={{ fontFamily: 'Material Symbols Outlined' }}>chevron_right</span>
                                    </div>
                                </div>
                            </Link>
                        )}


                        {/* Visão Geral CTA */}
                        <div className="bg-header-bg text-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold">Visão Geral</h3>
                            <p className="text-sm opacity-80 mt-1">Veja seu planejamento mensal completo.</p>
                            <Link href="/calendario" className="mt-4 w-full bg-white text-header-bg font-bold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <span>Ver Calendário →</span>
                            </Link>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    )
}
