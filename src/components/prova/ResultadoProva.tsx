'use client'

import Link from 'next/link'
import type { ProvaSemanal } from '@/types/provas'

interface ResultadoProvaProps {
    prova: ProvaSemanal
}

export function ResultadoProva({ prova }: ResultadoProvaProps) {
    const percentualAcerto = prova.totalQuestoes > 0
        ? (prova.acertos / prova.totalQuestoes) * 100
        : 0

    const minutos = Math.floor(prova.tempoGastoSegundos / 60)
    const segundos = prova.tempoGastoSegundos % 60

    // Classificação baseada na nota
    const getClassificacao = () => {
        if (prova.nota >= 900) return { emoji: '🏆', texto: 'Excelente!', cor: 'text-amber-500' }
        if (prova.nota >= 800) return { emoji: '🌟', texto: 'Muito Bom!', cor: 'text-green-600' }
        if (prova.nota >= 700) return { emoji: '👏', texto: 'Bom trabalho!', cor: 'text-sky-600' }
        if (prova.nota >= 600) return { emoji: '💪', texto: 'Continue assim!', cor: 'text-purple-600' }
        return { emoji: '📚', texto: 'Precisa estudar mais', cor: 'text-text-secondary' }
    }

    const classificacao = getClassificacao()

    return (
        <div className="bg-white shadow-custom rounded-2xl border border-card-border overflow-hidden">
            {/* Header com nota */}
            <div className="bg-gradient-to-br from-cyan-50 to-sky-100 p-8 text-center">
                <span className="text-6xl mb-4 block">{classificacao.emoji}</span>
                <h2 className={`text-2xl font-bold ${classificacao.cor}`}>
                    {classificacao.texto}
                </h2>
                <div className="mt-6">
                    <span className="text-text-secondary text-sm">Sua nota</span>
                    <p className="text-5xl font-bold text-primary mt-1">
                        {prova.nota.toFixed(0)}
                        <span className="text-xl text-text-secondary">/1000</span>
                    </p>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="p-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <span className="text-2xl font-bold text-green-600">
                        {prova.acertos}
                    </span>
                    <span className="text-text-secondary mx-1">/</span>
                    <span className="text-lg text-text-secondary">{prova.totalQuestoes}</span>
                    <p className="text-xs text-text-secondary mt-1">Acertos</p>
                </div>

                <div className="bg-sky-50 rounded-xl p-4 text-center">
                    <span className="text-2xl font-bold text-sky-600">
                        {percentualAcerto.toFixed(0)}%
                    </span>
                    <p className="text-xs text-text-secondary mt-1">Aproveitamento</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <span className="text-2xl font-bold text-purple-600">
                        {minutos}:{String(segundos).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">Tempo Total</p>
                </div>
            </div>

            {/* Ações */}
            <div className="p-6 space-y-3 border-t border-card-border">
                <Link
                    href={`/prova/resultado/${prova.id}`}
                    className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-primary rounded-lg text-center font-medium transition-colors"
                >
                    Ver Gabarito Detalhado
                </Link>
                <Link
                    href="/dashboard"
                    className="block w-full py-3 bg-accent-green-button hover:opacity-90 text-white rounded-lg text-center font-medium transition-colors"
                >
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    )
}

