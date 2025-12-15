'use client'

import { useState } from 'react'
import type { QuestaoProvaPublica, Alternativa } from '@/types/provas'

interface QuestaoCardProps {
    questao: QuestaoProvaPublica
    onResponder: (resposta: Alternativa) => Promise<unknown>
    carregando?: boolean
}

const alternativasOrdem: Alternativa[] = ['A', 'B', 'C', 'D', 'E']

export function QuestaoCard({ questao, onResponder, carregando }: QuestaoCardProps) {
    const [selecionada, setSelecionada] = useState<Alternativa | null>(null)
    const [confirmando, setConfirmando] = useState(false)

    const alternativas: Record<Alternativa, string> = {
        A: questao.alternativa_a,
        B: questao.alternativa_b,
        C: questao.alternativa_c,
        D: questao.alternativa_d,
        E: questao.alternativa_e
    }

    const handleSelecionar = (letra: Alternativa) => {
        if (carregando || confirmando) return
        setSelecionada(letra)
    }

    const handleConfirmar = async () => {
        if (!selecionada || carregando || confirmando) return
        setConfirmando(true)
        try {
            await onResponder(selecionada)
            // Reset para próxima questão
            setSelecionada(null)
        } finally {
            setConfirmando(false)
        }
    }

    return (
        <div
            className="bg-white shadow-custom rounded-xl border border-card-border overflow-hidden"
            style={{ userSelect: 'none' }} // Anti-fraude: bloqueio de seleção
        >
            {/* Header */}
            <div className="bg-slate-50 px-6 py-3 border-b border-card-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary font-medium">{questao.materia.toUpperCase()}</span>
                    <span className="text-xs px-2 py-1 bg-slate-200 rounded-full text-text-secondary">
                        {questao.dificuldade}
                    </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{questao.assunto}</p>
            </div>

            {/* Enunciado */}
            <div className="p-6">
                <p
                    className="text-primary leading-relaxed whitespace-pre-wrap"
                    onCopy={(e) => e.preventDefault()} // Anti-fraude: bloqueio de cópia
                    onCut={(e) => e.preventDefault()}
                >
                    {questao.enunciado}
                </p>
            </div>

            {/* Alternativas */}
            <div className="px-6 pb-6 space-y-3">
                {alternativasOrdem.map((letra) => (
                    <button
                        key={letra}
                        onClick={() => handleSelecionar(letra)}
                        disabled={carregando || confirmando}
                        className={`
                            w-full text-left p-4 rounded-lg border transition-all duration-200
                            flex items-start gap-4 group
                            ${selecionada === letra
                                ? 'bg-green-50 border-green-500 text-primary'
                                : 'bg-slate-50 border-slate-200 text-text-secondary hover:border-slate-300 hover:bg-slate-100'
                            }
                            ${(carregando || confirmando) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <span
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                                shrink-0 transition-all
                                ${selecionada === letra
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-200 text-text-secondary group-hover:bg-slate-300'
                                }
                            `}
                        >
                            {letra}
                        </span>
                        <span
                            className="flex-1 pt-1"
                            onCopy={(e) => e.preventDefault()}
                        >
                            {alternativas[letra]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Botão Confirmar */}
            <div className="px-6 pb-6">
                <button
                    onClick={handleConfirmar}
                    disabled={!selecionada || carregando || confirmando}
                    className={`
                        w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200
                        ${selecionada
                            ? 'bg-accent-green-button hover:opacity-90 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                        ${(carregando || confirmando) ? 'opacity-60 cursor-wait' : ''}
                    `}
                >
                    {confirmando ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Confirmando...
                        </span>
                    ) : (
                        'Confirmar Resposta'
                    )}
                </button>
                <p className="text-xs text-text-secondary text-center mt-2">
                    ⚠️ Atenção: Você não poderá voltar a esta questão
                </p>
            </div>
        </div>
    )
}

