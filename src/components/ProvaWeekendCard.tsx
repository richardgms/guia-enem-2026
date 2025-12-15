'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { verificarElegibilidade } from '@/lib/provas'
import type { ElegibilidadeProva } from '@/types/provas'

interface ProvaWeekendCardProps {
    forcarExibicao?: boolean // Para debug/teste
}

export function ProvaWeekendCard({ forcarExibicao = false }: ProvaWeekendCardProps) {
    const [elegibilidade, setElegibilidade] = useState<ElegibilidadeProva | null>(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        // Sempre verificar elegibilidade para detectar provas atrasadas
        verificarElegibilidade()
            .then(setElegibilidade)
            .catch(console.error)
            .finally(() => setCarregando(false))
    }, [])

    // Verificar se é domingo
    const hoje = new Date()
    const isDomingo = hoje.getDay() === 0

    // Mostrar se: domingo OU prova atrasada OU forçar exibição
    const deveMostrar = isDomingo || elegibilidade?.provaAtrasada || elegibilidade?.provaEmAndamento || forcarExibicao

    // Não mostrar se ainda carregando ou se não deve mostrar
    if (carregando || !deveMostrar) {
        return null
    }

    // Se já fez a prova e não tem atrasada, mostrar card de sucesso
    if (elegibilidade?.provaJaRealizada && !elegibilidade?.provaAtrasada) {
        return (
            <div className="bg-green-50 shadow-custom rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🎉</span>
                    <div>
                        <h3 className="text-lg font-bold text-green-700">Prova Semanal Concluída!</h3>
                        <p className="text-sm text-green-600">Você já realizou a prova desta semana.</p>
                    </div>
                </div>
                <Link
                    href="/estatisticas"
                    className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-center font-semibold transition-colors mt-4"
                >
                    Ver Resultado
                </Link>
            </div>
        )
    }

    // Se tem prova em andamento
    if (elegibilidade?.provaEmAndamento) {
        return (
            <div className="bg-amber-50 shadow-custom rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⏳</span>
                    <div>
                        <h3 className="text-lg font-bold text-amber-700">Prova em Andamento!</h3>
                        <p className="text-sm text-amber-600">
                            {elegibilidade?.provaAtrasada
                                ? `Prova da Semana ${elegibilidade.semanaAtrasada} - Continue!`
                                : 'Continue de onde parou.'}
                        </p>
                    </div>
                </div>
                <Link
                    href="/prova/realizar"
                    className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-center font-semibold transition-colors mt-4"
                >
                    Continuar Prova
                </Link>
            </div>
        )
    }

    // PROVA ATRASADA - estilo vermelho de urgência
    if (elegibilidade?.provaAtrasada) {
        return (
            <div className="bg-red-50 shadow-custom rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-red-700">Prova Atrasada</h3>
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                Semana {elegibilidade.semanaAtrasada}
                            </span>
                        </div>
                        <p className="text-sm text-red-600">
                            Você tem uma prova pendente. Faça agora!
                        </p>
                    </div>
                </div>
                <Link
                    href="/prova"
                    className="block w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-center font-semibold transition-colors mt-4"
                >
                    Fazer Prova Agora →
                </Link>
            </div>
        )
    }

    // Card padrão de prova disponível (domingo normal)
    return (
        <div className="bg-slate-50 shadow-custom rounded-2xl p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📝</span>
                <div>
                    <h3 className="text-lg font-bold text-slate-700">Prova Semanal</h3>
                    <p className="text-sm text-slate-600">
                        Teste seus conhecimentos da semana
                    </p>
                </div>
            </div>

            {/* Requisitos */}
            <div className="bg-white/60 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Dias estudados:</span>
                    <span className={`font-semibold ${(elegibilidade?.diasEstudados || 0) >= (elegibilidade?.diasNecessarios || 4)
                        ? 'text-green-600'
                        : 'text-amber-600'
                        }`}>
                        {elegibilidade?.diasEstudados || 0}/{elegibilidade?.diasNecessarios || 4}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                        className={`h-full transition-all ${(elegibilidade?.diasEstudados || 0) >= (elegibilidade?.diasNecessarios || 4)
                            ? 'bg-green-500'
                            : 'bg-amber-500'
                            }`}
                        style={{
                            width: `${Math.min(100, ((elegibilidade?.diasEstudados || 0) / (elegibilidade?.diasNecessarios || 4)) * 100)}%`
                        }}
                    />
                </div>
            </div>

            {elegibilidade?.elegivel ? (
                <Link
                    href="/prova"
                    className="block w-full py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-center font-semibold transition-colors"
                >
                    Iniciar Prova →
                </Link>
            ) : (
                <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">
                        {elegibilidade?.mensagem || 'Complete mais dias de estudo para liberar a prova'}
                    </p>
                    <Link
                        href="/dashboard"
                        className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                    >
                        Voltar aos estudos
                    </Link>
                </div>
            )}
        </div>
    )
}

