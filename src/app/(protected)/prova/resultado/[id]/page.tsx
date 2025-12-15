'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { getProvaPorId } from '@/lib/provas'
import { createClient } from '@/lib/supabase/client'
import type { ProvaSemanal, QuestaoProvaCompleta, Alternativa } from '@/types/provas'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function ResultadoProvaPage({ params }: PageProps) {
    const resolvedParams = use(params)
    const [prova, setProva] = useState<ProvaSemanal | null>(null)
    const [questoes, setQuestoes] = useState<QuestaoProvaCompleta[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        async function carregarResultado() {
            try {
                const provaData = await getProvaPorId(resolvedParams.id)
                if (!provaData) {
                    setErro('Prova não encontrada')
                    return
                }
                setProva(provaData)

                // Buscar questões com gabarito (resultado já disponível)
                const supabase = createClient()
                const questaoIds = provaData.respostas.map(r => r.questao_id)

                const { data: questoesData } = await supabase
                    .from('questoes_prova')
                    .select('*')
                    .in('id', questaoIds)

                setQuestoes(questoesData || [])
            } catch (e) {
                setErro(e instanceof Error ? e.message : 'Erro ao carregar resultado')
            } finally {
                setCarregando(false)
            }
        }

        carregarResultado()
    }, [resolvedParams.id])

    if (carregando) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        )
    }

    if (erro || !prova) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{erro || 'Prova não encontrada'}</p>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-accent-green-button hover:opacity-90 text-white rounded-lg transition-colors"
                    >
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Mapear questões por ID
    const questoesMap = new Map(questoes.map(q => [q.id, q]))

    return (
        <div className="py-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar ao Dashboard
                </Link>

                {/* Resumo */}
                <div className="bg-white shadow-custom rounded-2xl border border-card-border p-6 mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-4">
                        Gabarito - Semana {prova.semana}
                    </h1>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-100 rounded-xl p-4 text-center">
                            <span className="text-3xl font-bold text-primary">{prova.nota.toFixed(0)}</span>
                            <p className="text-xs text-text-secondary mt-1">Nota</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <span className="text-3xl font-bold text-green-600">{prova.acertos}</span>
                            <span className="text-text-secondary">/{prova.totalQuestoes}</span>
                            <p className="text-xs text-text-secondary mt-1">Acertos</p>
                        </div>
                        <div className="bg-sky-50 rounded-xl p-4 text-center">
                            <span className="text-3xl font-bold text-sky-600">
                                {Math.round((prova.acertos / prova.totalQuestoes) * 100)}%
                            </span>
                            <p className="text-xs text-text-secondary mt-1">Aproveitamento</p>
                        </div>
                    </div>
                </div>

                {/* Lista de Questões */}
                <div className="space-y-6">
                    {prova.respostas.map((resposta, index) => {
                        const questao = questoesMap.get(resposta.questao_id)
                        if (!questao) return null

                        const alternativas: Record<Alternativa, string> = {
                            A: questao.alternativa_a,
                            B: questao.alternativa_b,
                            C: questao.alternativa_c,
                            D: questao.alternativa_d,
                            E: questao.alternativa_e
                        }

                        return (
                            <div
                                key={resposta.questao_id}
                                className={`bg-white shadow-custom rounded-xl border overflow-hidden ${resposta.correta ? 'border-green-300' : 'border-red-300'
                                    }`}
                            >
                                {/* Header */}
                                <div className={`px-6 py-3 ${resposta.correta ? 'bg-green-50' : 'bg-red-50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-primary">
                                            Questão {index + 1}
                                        </span>
                                        <span className={`text-sm font-medium ${resposta.correta ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {resposta.correta ? '✓ Correta' : '✕ Incorreta'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {questao.materia} • {questao.assunto}
                                    </p>
                                </div>

                                {/* Enunciado */}
                                <div className="p-6 border-b border-card-border">
                                    <p className="text-primary whitespace-pre-wrap">
                                        {questao.enunciado}
                                    </p>
                                </div>

                                {/* Alternativas */}
                                <div className="p-6 space-y-2">
                                    {(['A', 'B', 'C', 'D', 'E'] as Alternativa[]).map((letra) => {
                                        const isGabarito = letra === questao.gabarito
                                        const isRespostaUsuario = letra === resposta.resposta
                                        const isErro = isRespostaUsuario && !resposta.correta

                                        return (
                                            <div
                                                key={letra}
                                                className={`flex items-start gap-3 p-3 rounded-lg ${isGabarito
                                                    ? 'bg-green-50 border border-green-200'
                                                    : isErro
                                                        ? 'bg-red-50 border border-red-200'
                                                        : 'bg-slate-50'
                                                    }`}
                                            >
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${isGabarito
                                                    ? 'bg-green-500 text-white'
                                                    : isErro
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-slate-200 text-text-secondary'
                                                    }`}>
                                                    {letra}
                                                </span>
                                                <span className={`flex-1 ${isGabarito ? 'text-green-700' : isErro ? 'text-red-700' : 'text-text-secondary'
                                                    }`}>
                                                    {alternativas[letra]}
                                                </span>
                                                {isGabarito && (
                                                    <span className="text-green-600 text-xs font-medium">Gabarito</span>
                                                )}
                                                {isErro && (
                                                    <span className="text-red-600 text-xs font-medium">Sua resposta</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Explicação */}
                                {questao.explicacao && (
                                    <div className="px-6 pb-6">
                                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                                            <p className="text-xs text-sky-700 font-semibold mb-2">
                                                💡 Explicação
                                            </p>
                                            <p className="text-primary text-sm">
                                                {questao.explicacao}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Tempo */}
                                <div className="px-6 pb-4">
                                    <p className="text-xs text-text-secondary">
                                        Tempo: {Math.floor(resposta.tempo_segundos / 60)}:{String(resposta.tempo_segundos % 60).padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Voltar */}
                <div className="mt-8 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent-green-button hover:opacity-90 text-white rounded-lg transition-colors"
                    >
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

