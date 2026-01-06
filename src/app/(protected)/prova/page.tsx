'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProva } from '@/hooks/useProva'

export default function ProvaPage() {
    const router = useRouter()
    const {
        elegibilidade,
        carregando,
        erro,
        verificarElegibilidadeProva,
        comecarProva
    } = useProva()

    useEffect(() => {
        verificarElegibilidadeProva()
    }, [verificarElegibilidadeProva])

    const handleIniciarProva = async () => {
        try {
            await comecarProva()
            router.push('/prova/realizar')
        } catch (e) {
            console.error(e)
        }
    }

    if (carregando) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="py-4">
            <div className="max-w-2xl mx-auto">
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

                <h1 className="text-3xl font-bold text-primary mb-2">Prova Semanal</h1>
                <p className="text-text-secondary mb-4">
                    Teste seus conhecimentos da semana em condições reais de prova
                </p>

                {/* Indicador de Semana e Data */}
                {elegibilidade && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            📅 Semana {elegibilidade.semanaAtrasada || elegibilidade.semanaAtual}
                        </span>
                        {elegibilidade.provaAtrasada && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                ⚠️ Prova Atrasada
                            </span>
                        )}
                    </div>
                )}

                {/* Card Principal */}
                <div className="bg-white shadow-custom rounded-2xl border border-card-border overflow-hidden">
                    {/* Regras */}
                    <div className="p-6 border-b border-card-border">
                        <h2 className="text-lg font-semibold text-primary mb-4">⚠️ Regras da Prova</h2>
                        <ul className="space-y-2 text-sm text-text-secondary">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">✕</span>
                                <span>Não é possível voltar para questões anteriores</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">✕</span>
                                <span>Não é possível pular questões</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">✕</span>
                                <span>Sair da página finaliza a prova automaticamente</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">✕</span>
                                <span>Você só pode fazer a prova uma vez por semana</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500">⏱️</span>
                                <span>Tempo limite: 50 minutos</span>
                            </li>
                        </ul>
                    </div>

                    {/* Status de Elegibilidade */}
                    <div className="p-6">
                        {erro && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-600 text-sm">{erro}</p>
                            </div>
                        )}

                        {elegibilidade && (
                            <>
                                {/* Indicador de dias estudados */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-text-secondary">Dias estudados esta semana</span>
                                        <span className={elegibilidade.diasEstudados >= elegibilidade.diasNecessarios
                                            ? 'text-green-600 font-semibold'
                                            : 'text-text-secondary'
                                        }>
                                            {elegibilidade.diasEstudados}/{elegibilidade.diasNecessarios}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${elegibilidade.diasEstudados >= elegibilidade.diasNecessarios
                                                ? 'bg-green-500'
                                                : 'bg-amber-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(100, (elegibilidade.diasEstudados / elegibilidade.diasNecessarios) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Mensagem de Status */}
                                <div className={`rounded-lg p-4 mb-6 ${elegibilidade.elegivel
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-slate-100'
                                    }`}>
                                    <p className={elegibilidade.elegivel ? 'text-green-700' : 'text-text-secondary'}>
                                        {elegibilidade.mensagem}
                                    </p>
                                </div>

                                {/* Prova já realizada */}
                                {elegibilidade.provaJaRealizada && (
                                    <Link
                                        href="/estatisticas"
                                        className="block w-full py-4 bg-slate-100 hover:bg-slate-200 text-primary rounded-lg text-center font-semibold transition-colors"
                                    >
                                        Ver Resultado da Prova
                                    </Link>
                                )}

                                {/* Prova em andamento */}
                                {elegibilidade.provaEmAndamento && (
                                    <button
                                        onClick={() => router.push('/prova/realizar')}
                                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Continuar Prova em Andamento
                                    </button>
                                )}

                                {/* Elegível para iniciar */}
                                {elegibilidade.elegivel && !elegibilidade.provaEmAndamento && (
                                    <button
                                        onClick={handleIniciarProva}
                                        disabled={carregando}
                                        className="w-full py-4 bg-accent-green-button hover:opacity-90 text-white rounded-lg font-semibold transition-colors disabled:opacity-60"
                                    >
                                        {carregando ? 'Iniciando...' : 'Iniciar Prova'}
                                    </button>
                                )}

                                {/* Não elegível */}
                                {!elegibilidade.elegivel && !elegibilidade.provaJaRealizada && (
                                    <div className="text-center">
                                        <p className="text-text-secondary text-sm mb-4">
                                            Complete mais dias de estudo para desbloquear a prova
                                        </p>
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center gap-2 text-accent-green-button hover:opacity-80 transition-colors font-semibold"
                                        >
                                            Ir para os estudos
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

