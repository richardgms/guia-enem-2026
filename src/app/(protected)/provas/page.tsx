'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProvaSemanal } from '@/types/provas'
import Link from 'next/link'
import { CheckCircle, Clock, Target, ChevronRight, Trophy, XCircle } from 'lucide-react'

export default function ProvasPage() {
    const [provas, setProvas] = useState<ProvaSemanal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function carregarProvas() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('provas_semanais')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'finalizada')
                .order('finalizada_em', { ascending: false })

            if (!error && data) {
                setProvas(data.map(p => ({
                    id: p.id,
                    semana: p.semana,
                    ano: p.ano,
                    status: p.status,
                    iniciadaEm: p.iniciada_em ? new Date(p.iniciada_em) : undefined,
                    finalizadaEm: p.finalizada_em ? new Date(p.finalizada_em) : undefined,
                    tempoLimite: p.tempo_limite ? new Date(p.tempo_limite) : undefined,
                    totalQuestoes: p.total_questoes,
                    acertos: p.acertos,
                    nota: p.nota,
                    tempoGastoSegundos: p.tempo_gasto_segundos,
                    questaoAtual: p.questao_atual,
                    respostas: p.respostas || [],
                    sessionToken: p.session_token || undefined
                })))
            }

            setLoading(false)
        }

        carregarProvas()
    }, [])

    function formatarTempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60)
        const segs = segundos % 60
        return `${minutos}min ${segs}s`
    }

    function formatarData(data?: Date): string {
        if (!data) return '-'
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    function getNotaColor(nota: number): string {
        if (nota >= 800) return 'text-emerald-500'
        if (nota >= 600) return 'text-blue-500'
        if (nota >= 400) return 'text-amber-500'
        return 'text-red-500'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-surface rounded w-48"></div>
                        <div className="h-32 bg-surface rounded"></div>
                        <div className="h-32 bg-surface rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">
                        📋 Histórico de Provas
                    </h1>
                    <p className="text-text-secondary">
                        Veja suas provas realizadas e revise os gabaritos
                    </p>
                </div>

                {/* Lista de Provas */}
                {provas.length === 0 ? (
                    <div className="bg-white shadow-sm rounded-xl p-12 text-center border border-border">
                        <Trophy className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-primary mb-2">
                            Nenhuma prova realizada ainda
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Complete uma prova semanal para ver seu histórico aqui
                        </p>
                        <Link
                            href="/prova"
                            className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary/90 transition-colors"
                        >
                            Ir para Provas
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {provas.map((prova) => (
                            <Link
                                key={prova.id}
                                href={`/provas/${prova.id}`}
                                className="block bg-white shadow-sm rounded-xl p-6 border border-border hover:border-brand-primary/50 transition-all hover:shadow-lg group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {/* Título */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">📝</span>
                                            <div>
                                                <h2 className="text-lg font-semibold text-primary">
                                                    Prova Semanal {prova.semana}
                                                </h2>
                                                <p className="text-sm text-text-secondary">
                                                    {formatarData(prova.finalizadaEm)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Métricas */}
                                        <div className="flex items-center gap-6 text-sm">
                                            {/* Nota */}
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-brand-primary" />
                                                <span className={`font-bold ${getNotaColor(prova.nota)}`}>
                                                    {prova.nota} pts
                                                </span>
                                            </div>

                                            {/* Acertos */}
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <span className="text-text-secondary">
                                                    {prova.acertos}/{prova.totalQuestoes} acertos
                                                </span>
                                            </div>

                                            {/* Erros */}
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-text-secondary">
                                                    {prova.totalQuestoes - prova.acertos} erros
                                                </span>
                                            </div>

                                            {/* Tempo */}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-text-tertiary" />
                                                <span className="text-text-secondary">
                                                    {formatarTempo(prova.tempoGastoSegundos)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seta */}
                                    <ChevronRight className="w-6 h-6 text-text-tertiary group-hover:text-brand-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
