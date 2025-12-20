import { createClient } from "@/lib/supabase/server"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"
import { getHojeBrasil, calcularHistoricoPresenca, gerarStatsPresenca } from "@/lib/studyProgress"
import { ListaPresenca } from "@/components/presenca/ListaPresenca"

export const dynamic = 'force-dynamic'

export default async function PresencaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const conteudos = conteudosData.conteudos as ConteudoDia[]
    const hoje = getHojeBrasil()

    if (!user) return null

    // 1. Buscar Progresso Real
    const { data: progressDB } = await supabase
        .from('progresso')
        .select('data_id, concluido, first_completed_at')
        .eq('user_id', user.id)

    const progressos: Record<string, { concluido: boolean, first_completed_at?: string }> = {}
    progressDB?.forEach(p => {
        progressos[p.data_id] = {
            concluido: p.concluido,
            first_completed_at: p.first_completed_at
        }
    })

    // 2. Buscar Provas Realizadas
    const { data: provasDB } = await supabase
        .from('provas_semanais')
        .select('semana, finalizada_em')
        .eq('user_id', user.id)
        .eq('status', 'finalizada')

    const provasRealizadas = (provasDB || []).map(p => ({
        semana: p.semana,
        finalizada_em: p.finalizada_em
    }))

    // 3. Calcular Histórico Dinâmico
    const historico = calcularHistoricoPresenca(conteudos, progressos, provasRealizadas, hoje)
    const stats = gerarStatsPresenca(historico)

    // Mapa de conteúdo por data_id
    const conteudoMap: Record<string, ConteudoDia> = {}
    conteudos.forEach(c => { conteudoMap[c.data] = c })

    const taxaPresenca = stats.taxa

    return (
        <div className="p-6 lg:p-8 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">📋 Minha Presença</h1>
                    <p className="text-text-secondary mt-2">
                        Acompanhe sua frequência de estudos diários
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.presencas}</p>
                        <p className="text-sm text-text-secondary mt-1">✅ Presenças</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-amber-600">{stats.atrasados}</p>
                        <p className="text-sm text-text-secondary mt-1">⚠️ Recuperados</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-red-600">{stats.faltas}</p>
                        <p className="text-sm text-text-secondary mt-1">❌ Faltas</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-primary">{taxaPresenca}%</p>
                        <p className="text-sm text-text-secondary mt-1">📊 Taxa</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl p-5 border shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-semibold text-primary">Taxa de Presença</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">
                                (Presença no dia: 1.0 • Recuperado: 0.5)
                            </p>
                        </div>
                        <span className="text-sm font-medium text-text-secondary">
                            {stats.totalPontos} de {stats.total} {stats.total === 1 ? 'ponto' : 'pontos'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${taxaPresenca}%` }}
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                        {taxaPresenca >= 80
                            ? '🎉 Excelente frequência! Continue assim!'
                            : taxaPresenca >= 60
                                ? '👍 Boa frequência, mas pode melhorar!'
                                : '⚠️ Frequência baixa. Tente estudar todos os dias!'}
                    </p>
                </div>

                {/* Attendance List Area */}
                <ListaPresenca historico={historico} conteudoMap={conteudoMap} />

                {/* Legend */}
                <div className="bg-slate-50 rounded-xl p-4 border">
                    <h4 className="font-medium text-sm text-primary mb-3">Legenda</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span className="text-text-secondary">Presente - Estudou no dia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span className="text-text-secondary">Recuperou - Fez atrasado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>❌</span>
                            <span className="text-text-secondary">Falta - Não estudou</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

