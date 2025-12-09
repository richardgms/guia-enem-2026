"use client"

import Link from "next/link"
import { Check, Lock, ChevronRight } from "lucide-react"
import type { ConteudoDia } from "@/types"
import type { ProgressoDia } from "@/types/database"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { materiaColors, materiaLabels, dificuldadeColors, dificuldadeLabels } from "@/lib/constants"

interface DayCardProps {
    conteudo: ConteudoDia
    progresso?: ProgressoDia
    compact?: boolean
}

export function DayCard({ conteudo, progresso, compact = false }: DayCardProps) {
    const isConcluido = progresso?.concluido
    const isPending = !isConcluido
    const colorClass = materiaColors[conteudo.materia] || "bg-gray-100 text-gray-700"

    // Se for compacto, renderiza versão simplificada
    if (compact) {
        return (
            <Link href={`/dia/${conteudo.data}`}>
                <Card className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group h-full">
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground font-medium">
                            {conteudo.data.split('-').reverse().slice(0, 2).join('/')} • {conteudo.diaSemana}
                        </div>
                        <div className="font-semibold text-sm line-clamp-2">{conteudo.assunto}</div>
                        <Badge variant="outline" className={cn("w-fit text-[10px] px-1.5 h-5", colorClass)}>
                            {materiaLabels[conteudo.materia] || conteudo.materia}
                        </Badge>
                    </div>
                    {isConcluido ? (
                        <div className="bg-green-100 p-1.5 rounded-full">
                            <Check className="w-3 h-3 text-green-600" />
                        </div>
                    ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </Card>
            </Link>
        )
    }

    return (
        <Link href={`/dia/${conteudo.data}`}>
            <Card
                className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-l-4 group",
                    isConcluido ? "border-l-green-500 opacity-90" : "border-l-blue-500"
                )}
            >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {conteudo.diaSemana}
                            </span>
                            <span>•</span>
                            <span>{conteudo.data.split("-").reverse().join("/")}</span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
                                {conteudo.assunto}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className={cn("font-medium transition-colors", colorClass)}>
                                    {materiaLabels[conteudo.materia] || conteudo.materia}
                                </Badge>
                                <Badge variant="outline" className={cn("text-xs font-medium px-2 py-1 bg-secondary rounded-md border-transparent transition-colors", dificuldadeColors[conteudo.dificuldade])}>
                                    {dificuldadeLabels[conteudo.dificuldade] || conteudo.dificuldade}
                                </Badge>
                                <div className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-1 rounded-md">
                                    ⏱️ {conteudo.tempoEstimado}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        {isConcluido ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium text-sm animate-in fade-in zoom-in">
                                <Check className="h-4 w-4" />
                                <span>Concluído</span>
                            </div>
                        ) : (
                            <div className="bg-primary/10 text-primary p-2 rounded-full transform group-hover:translate-x-1 transition-transform duration-300">
                                <ChevronRight className="h-6 w-6" />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}
