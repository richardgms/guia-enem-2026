'use client'

interface ProvaProgressProps {
    questaoAtual: number // 0-indexed
    totalQuestoes: number
}

export function ProvaProgress({ questaoAtual, totalQuestoes }: ProvaProgressProps) {
    const progresso = totalQuestoes > 0 ? ((questaoAtual) / totalQuestoes) * 100 : 0

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                    Questão <span className="text-primary font-semibold">{questaoAtual + 1}</span> de{' '}
                    <span className="text-primary font-semibold">{totalQuestoes}</span>
                </span>
                <span className="text-sm text-text-secondary">
                    {Math.round(progresso)}% concluído
                </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-500 ease-out"
                    style={{ width: `${progresso}%` }}
                />
            </div>
            {/* Indicadores de questões */}
            <div className="flex gap-1 mt-3 flex-wrap">
                {Array.from({ length: totalQuestoes }).map((_, i) => (
                    <div
                        key={i}
                        className={`
                            w-3 h-3 rounded-full transition-all duration-300
                            ${i < questaoAtual
                                ? 'bg-green-500'
                                : i === questaoAtual
                                    ? 'bg-primary ring-2 ring-cyan-400'
                                    : 'bg-slate-300'
                            }
                        `}
                    />
                ))}
            </div>
        </div>
    )
}

