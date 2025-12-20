"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConteudoDia } from "@/types"
import type { ProgressoDia } from "@/types/database"

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// Interface para provas realizadas
interface ProvaRealizada {
    semana: number
    finalizadaEm: string
}

interface CalendarioMensalProps {
    conteudos: ConteudoDia[]
    progressos: Record<string, ProgressoDia>
    provasRealizadas?: ProvaRealizada[]
}

import { materiaColors, materiaLabels } from "@/lib/constants"
import { getDomingoDaSemana } from "@/lib/provaUtils"

export function CalendarioMensal({ conteudos, progressos, provasRealizadas = [] }: CalendarioMensalProps) {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 11)) // Dezembro 2025

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startingDay = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days = []
    // Padding days
    for (let i = 0; i < startingDay; i++) {
        days.push(null)
    }
    // Actual days
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i))
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1))

    const getContentForDate = (date: Date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return conteudos.find(c => c.data === dateStr)
    }

    const getStatusColor = (conteudo?: ConteudoDia) => {
        if (!conteudo) return "bg-card"

        const progresso = progressos[conteudo.data]
        if (progresso?.concluido) return "bg-green-100 dark:bg-green-900/30"
        if (progresso) return "bg-yellow-100 dark:bg-yellow-900/30"

        // Passado e não feito?
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        if (conteudo.data < todayStr) return "bg-red-50 dark:bg-red-950/30"

        return "bg-card"
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    {MONTHS[month]} {year}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="bg-muted p-2 text-center text-xs font-bold text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}

                {days.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="bg-card min-h-[100px]" />

                    const conteudo = getContentForDate(date)
                    const colorClass = getStatusColor(conteudo)

                    const today = new Date()
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

                    const isToday = dateStr === todayStr
                    const isSunday = date.getDay() === 0

                    return (
                        <div key={date.toISOString()} className={cn("min-h-[100px] p-2 relative group transition-colors", colorClass)}>
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {date.getDate()}
                                </span>
                                {conteudo && (
                                    <div className="flex gap-1">
                                        {progressos[conteudo.data]?.concluido && (
                                            <Check className="h-3 w-3 text-green-600" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Prova indicator - verifica se foi realizada */}
                            {isSunday && date.getDate() === 14 && date.getMonth() === 11 && date.getFullYear() === 2025 && (() => {
                                const sundayDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                const isOverdue = sundayDateStr < todayStr
                                // Verificar se a prova da semana 1 foi realizada
                                const provaRealizada = provasRealizadas.find(p => p.semana === 1)
                                const foiRealizada = !!provaRealizada

                                if (foiRealizada) {
                                    return (
                                        <div className="block mt-1">
                                            <Badge
                                                variant="secondary"
                                                className="w-full justify-start text-[10px] px-1 mb-1 bg-green-100 text-green-700"
                                            >
                                                ✓ Prova Realizada
                                            </Badge>
                                        </div>
                                    )
                                }

                                return (
                                    <Link href="/prova" className="block mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "w-full justify-start text-[10px] px-1 mb-1",
                                                isOverdue
                                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            )}
                                        >
                                            {isOverdue ? "⚠️ Prova Atrasada" : "📝 Prova Semanal"}
                                        </Badge>
                                    </Link>
                                )
                            })()}

                            {/* Indicador de dia recuperado - dias entre a prova e quando foi feita */}
                            {!isSunday && (() => {
                                // Verificar se este dia está entre o domingo da prova e a data de finalização
                                const prova = provasRealizadas.find(p => {
                                    if (!p.finalizadaEm) return false
                                    const domingoDaProva = getDomingoDaSemana(p.semana)
                                    const dataFinalizacao = new Date(p.finalizadaEm)
                                    const dataAtual = new Date(dateStr + 'T12:00:00')

                                    // Verifica se a data está entre o domingo+1 e a data de finalização
                                    const diaAposProva = new Date(domingoDaProva)
                                    diaAposProva.setDate(diaAposProva.getDate() + 1)

                                    return dataAtual >= diaAposProva && dataAtual <= dataFinalizacao
                                })

                                if (prova && !conteudo) {
                                    return (
                                        <div className="mt-1">
                                            <Badge
                                                variant="secondary"
                                                className="w-full justify-start text-[10px] px-1 mb-1 bg-emerald-50 text-emerald-600"
                                            >
                                                ✓ Recuperado
                                            </Badge>
                                        </div>
                                    )
                                }
                                return null
                            })()}

                            {conteudo ? (
                                <Link href={`/dia/${conteudo.data}`} className="block mt-1">
                                    <Badge variant="secondary" className={cn(
                                        "w-full justify-start text-[10px] px-1 overflow-hidden whitespace-nowrap text-ellipsis mb-1",
                                        materiaColors[conteudo.materia]
                                    )}>
                                        {materiaLabels[conteudo.materia] || conteudo.materia}
                                    </Badge>
                                    <p className="text-[10px] leading-tight line-clamp-2 font-medium text-foreground/80 group-hover:text-primary transition-colors">
                                        {conteudo.assunto}
                                    </p>
                                </Link>
                            ) : !isSunday && (
                                <div className="h-full w-full flex items-center justify-center opacity-20">
                                    -
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

