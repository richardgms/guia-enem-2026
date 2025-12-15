'use client'

import { useEffect, useState } from 'react'

interface ProvaTimerProps {
    tempoRestante: number // em segundos
    onTempoEsgotado?: () => void
}

export function ProvaTimer({ tempoRestante, onTempoEsgotado }: ProvaTimerProps) {
    const [piscando, setPiscando] = useState(false)

    // Formatação do tempo
    const minutos = Math.floor(tempoRestante / 60)
    const segundos = tempoRestante % 60
    const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`

    // Alerta quando tempo está acabando
    const tempoAlerta = tempoRestante <= 300 // 5 minutos
    const tempoCritico = tempoRestante <= 60 // 1 minuto

    useEffect(() => {
        if (tempoCritico) {
            const interval = setInterval(() => {
                setPiscando(prev => !prev)
            }, 500)
            return () => clearInterval(interval)
        }
        setPiscando(false)
    }, [tempoCritico])

    useEffect(() => {
        if (tempoRestante === 0 && onTempoEsgotado) {
            onTempoEsgotado()
        }
    }, [tempoRestante, onTempoEsgotado])

    return (
        <div
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold
                transition-all duration-300
                ${tempoCritico
                    ? `bg-red-100 text-red-600 ${piscando ? 'opacity-100' : 'opacity-70'}`
                    : tempoAlerta
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-primary'
                }
            `}
        >
            <svg
                className={`w-5 h-5 ${tempoCritico ? 'animate-pulse' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{tempoFormatado}</span>
        </div>
    )
}
