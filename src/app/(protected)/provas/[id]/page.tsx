'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getQuestoesPorSemana, questoesSemana1 } from '@/data/questoesProva'
import type { ProvaSemanal, RespostaQuestao } from '@/types/provas'
import type { QuestaoProvaLocal } from '@/data/questoesProva'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Clock, Target, BookOpen } from 'lucide-react'

interface ProvaDetalhePageProps {
    params: Promise<{ id: string }>
}

export default function ProvaDetalhePage({ params }: ProvaDetalhePageProps) {
    const { id } = use(params)
    const [prova, setProva] = useState<ProvaSemanal | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function carregarProva() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('provas_semanais')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (!error && data) {
                setProva({
                    id: data.id,
                    semana: data.semana,
                    ano: data.ano,
                    status: data.status,
                    iniciadaEm: data.iniciada_em ? new Date(data.iniciada_em) : undefined,
                    finalizadaEm: data.finalizada_em ? new Date(data.finalizada_em) : undefined,
                    tempoLimite: data.tempo_limite ? new Date(data.tempo_limite) : undefined,
                    totalQuestoes: data.total_questoes,
                    acertos: data.acertos,
                    nota: data.nota,
                    tempoGastoSegundos: data.tempo_gasto_segundos,
                    questaoAtual: data.questao_atual,
                    respostas: data.respostas || [],
                    sessionToken: data.session_token || undefined
                })
            }

            setLoading(false)
        }

        carregarProva()
    }, [id])

    function formatarTempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60)
        const segs = segundos % 60
        return `${minutos}min ${segs}s`
    }

    function formatarData(data?: Date): string {
        if (!data) return '-'
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    function getNotaColor(nota: number): string {
        if (nota >= 800) return 'text-emerald-500'
        if (nota >= 600) return 'text-blue-500'
        if (nota >= 400) return 'text-amber-500'
        return 'text-red-500'
    }

    function getMateriaEmoji(materia: string): string {
        const emojis: Record<string, string> = {
            'matematica': '📐',
            'portugues': '📖',
            'biologia': '🧬',
            'historia': '🏛️',
            'redacao': '✍️',
            'fisica': '⚡',
            'quimica': '🧪',
            'geografia': '🌍'
        }
        return emojis[materia] || '📝'
    }

    function getMateriaLabel(materia: string): string {
        const labels: Record<string, string> = {
            'matematica': 'Matemática',
            'portugues': 'Português',
            'biologia': 'Biologia',
            'historia': 'História',
            'redacao': 'Redação',
            'fisica': 'Física',
            'quimica': 'Química',
            'geografia': 'Geografia'
        }
        return labels[materia] || materia
    }

    function getAlternativaTexto(questao: QuestaoProvaLocal, letra: string): string {
        switch (letra) {
            case 'A': return questao.alternativa_a
            case 'B': return questao.alternativa_b
            case 'C': return questao.alternativa_c
            case 'D': return questao.alternativa_d
            case 'E': return questao.alternativa_e
            default: return ''
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-surface rounded w-48"></div>
                        <div className="h-32 bg-surface rounded"></div>
                        <div className="h-64 bg-surface rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!prova) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-surface rounded-xl p-12 text-center border border-border">
                        <h2 className="text-xl font-semibold text-primary mb-4">
                            Prova não encontrada
                        </h2>
                        <Link
                            href="/provas"
                            className="inline-flex items-center gap-2 text-brand-primary hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para histórico
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Buscar questões da semana
    const questoes = getQuestoesPorSemana(prova.semana)

    // Criar mapa de respostas
    const respostasMap = new Map<string, RespostaQuestao>()
    prova.respostas.forEach(r => respostasMap.set(r.questao_id, r))

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/provas"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para histórico
                    </Link>

                    <h1 className="text-2xl font-bold text-primary mb-2">
                        📝 Prova Semanal {prova.semana} - Gabarito
                    </h1>
                    <p className="text-text-secondary">
                        Realizada em {formatarData(prova.finalizadaEm)}
                    </p>
                </div>

                {/* Resumo */}
                <div className="bg-white rounded-xl p-6 border border-border mb-8 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Nota */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-brand-primary" />
                                <span className="text-sm text-text-secondary">Nota</span>
                            </div>
                            <span className={`text-3xl font-bold ${getNotaColor(prova.nota)}`}>
                                {prova.nota}
                            </span>
                        </div>

                        {/* Acertos */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm text-text-secondary">Acertos</span>
                            </div>
                            <span className="text-3xl font-bold text-emerald-500">
                                {prova.acertos}
                            </span>
                        </div>

                        {/* Erros */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-text-secondary">Erros</span>
                            </div>
                            <span className="text-3xl font-bold text-red-500">
                                {prova.totalQuestoes - prova.acertos}
                            </span>
                        </div>

                        {/* Tempo */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-text-tertiary" />
                                <span className="text-sm text-text-secondary">Tempo</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {formatarTempo(prova.tempoGastoSegundos)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Questões */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Questões e Gabarito
                    </h2>

                    {questoes.map((questao, index) => {
                        const resposta = respostasMap.get(questao.id)
                        const acertou = resposta?.correta ?? false
                        const respostaUsuario = resposta?.resposta || '-'

                        return (
                            <div
                                key={questao.id}
                                className={`bg-surface rounded-xl border-2 overflow-hidden ${acertou ? 'border-emerald-500/30' : 'border-red-500/30'
                                    }`}
                            >
                                {/* Header da questão */}
                                <div className={`px-6 py-4 ${acertou ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{getMateriaEmoji(questao.materia)}</span>
                                            <div>
                                                <span className="font-semibold text-primary">
                                                    Questão {index + 1}
                                                </span>
                                                <span className="text-text-secondary ml-2">
                                                    • {getMateriaLabel(questao.materia)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {acertou ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <span className="text-emerald-500 font-medium">Acertou!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                    <span className="text-red-500 font-medium">Errou</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">{questao.assunto}</p>
                                </div>

                                {/* Enunciado */}
                                <div className="px-6 py-4 border-b border-border">
                                    <p className="text-primary leading-relaxed whitespace-pre-wrap">
                                        {questao.enunciado}
                                    </p>
                                </div>

                                {/* Alternativas */}
                                <div className="px-6 py-4 space-y-2">
                                    {['A', 'B', 'C', 'D', 'E'].map(letra => {
                                        const texto = getAlternativaTexto(questao, letra)
                                        const isGabarito = letra === questao.gabarito
                                        const isResposta = letra === respostaUsuario
                                        const errou = isResposta && !acertou

                                        let bgClass = 'bg-background'
                                        let borderClass = 'border-border'
                                        let textClass = 'text-text-secondary'

                                        if (isGabarito) {
                                            bgClass = 'bg-emerald-500/10'
                                            borderClass = 'border-emerald-500'
                                            textClass = 'text-emerald-600'
                                        } else if (errou) {
                                            bgClass = 'bg-red-500/10'
                                            borderClass = 'border-red-500'
                                            textClass = 'text-red-600'
                                        }

                                        return (
                                            <div
                                                key={letra}
                                                className={`flex items-start gap-3 p-3 rounded-lg border ${bgClass} ${borderClass} ${textClass}`}
                                            >
                                                <span className="font-bold w-6">{letra})</span>
                                                <span className="flex-1">{texto}</span>
                                                {isGabarito && (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                )}
                                                {errou && (
                                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Explicação */}
                                <div className="px-6 py-4 bg-blue-500/5 border-t border-border">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">💡</span>
                                        <div>
                                            <span className="font-semibold text-blue-600 block mb-1">
                                                Explicação
                                            </span>
                                            <p className="text-text-secondary text-sm leading-relaxed">
                                                {questao.explicacao}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Botão voltar */}
                <div className="mt-8 text-center">
                    <Link
                        href="/provas"
                        className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Histórico
                    </Link>
                </div>
            </div>
        </div>
    )
}
