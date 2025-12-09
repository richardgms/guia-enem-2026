"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, ChevronRight, Eye, HelpCircle } from "lucide-react"
import type { Questao } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import "katex/dist/katex.min.css"

interface QuestaoCardProps {
    questao: Questao
    onResponder: (acertou: boolean) => void
    respondida?: boolean
    respostaUsuario?: string | null
    numero: number
    total: number
}

export function QuestaoCard({
    questao,
    onResponder,
    respondida = false,
    respostaUsuario = null,
    numero,
    total
}: QuestaoCardProps) {
    const [selecionada, setSelecionada] = useState<string | null>(null)
    // Se o componente receber respondida=true via props, respeita isso.
    // Senão, controla localmente.
    const [localRespondida, setLocalRespondida] = useState(false)
    const [mostrarGabarito, setMostrarGabarito] = useState(false)

    // Sincroniza estado local quando props mudam (ex: ao navegar entre questões já respondidas)
    useEffect(() => {
        if (respondida) {
            setLocalRespondida(true)
            if (respostaUsuario) setSelecionada(respostaUsuario)
            setMostrarGabarito(true)
        } else {
            setLocalRespondida(false)
            setSelecionada(null)
            setMostrarGabarito(false)
        }
    }, [respondida, respostaUsuario, questao.id])

    const handleConfirmar = () => {
        if (!selecionada) return

        const isCorreta = selecionada === questao.gabarito
        setLocalRespondida(true)
        setMostrarGabarito(true)
        onResponder(isCorreta)
    }

    const handleVerGabarito = () => {
        setLocalRespondida(true)
        setMostrarGabarito(true)
        setSelecionada(null) // Reseta seleção se apenas viu gabarito
        onResponder(false)
    }

    const isInteractionDisabled = localRespondida || respondida

    const getAlternativaStyle = (letra: string) => {
        const baseStyle = "w-full p-4 text-left border rounded-lg transition-all flex items-start gap-3 cursor-pointer hover:bg-muted/50"

        if (!mostrarGabarito) {
            return cn(
                baseStyle,
                selecionada === letra
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
            )
        }

        const isGabarito = letra === questao.gabarito
        const isSelected = letra === selecionada

        if (isGabarito) {
            return cn(baseStyle, "border-green-500 bg-green-50 text-green-700 font-medium ring-1 ring-green-500 hover:bg-green-50")
        }

        if (isSelected && !isGabarito) {
            return cn(baseStyle, "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500 hover:bg-red-50")
        }

        return cn(baseStyle, "opacity-60")
    }

    return (
        <Card className="w-full shadow-sm border-2">
            <CardHeader className="bg-muted/30 pb-4 border-b space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="font-bold">ENEM {questao.ano}</Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] mt-0.5">
                                Questão {numero} de {total}
                            </span>
                        </div>
                        {/* Renderização do Enunciado com LaTeX */}
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questao.enunciado}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {isInteractionDisabled && (
                        <Badge
                            variant={selecionada === questao.gabarito ? "default" : "destructive"}
                            className="shrink-0 gap-1.5 px-3 py-1.5 text-sm font-medium"
                        >
                            {selecionada === questao.gabarito ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Correto!</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4" />
                                    <span>{selecionada ? "Incorreto" : "Gabarito"}</span>
                                </>
                            )}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                <RadioGroup
                    value={selecionada || ""}
                    onValueChange={(val) => !isInteractionDisabled && setSelecionada(val)}
                    className="space-y-3"
                >
                    {questao.alternativas.map((alt) => (
                        <div key={alt.letra} className="relative">
                            <RadioGroupItem
                                value={alt.letra}
                                id={`q-${questao.id}-${alt.letra}`}
                                className="sr-only"
                            />
                            <Label
                                htmlFor={`q-${questao.id}-${alt.letra}`}
                                className={getAlternativaStyle(alt.letra)}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold shrink-0 mt-0.5 transition-colors",
                                    selecionada === alt.letra || (mostrarGabarito && alt.letra === questao.gabarito)
                                        ? "border-current"
                                        : "border-muted-foreground text-muted-foreground"
                                )}>
                                    {alt.letra}
                                </div>
                                <div className="flex-1 leading-relaxed text-sm md:text-base">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            p: ({ children }) => <span className="block">{children}</span>
                                        }}
                                    >
                                        {alt.texto}
                                    </ReactMarkdown>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                {mostrarGabarito && questao.explicacao && (
                    <div className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-lg border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 font-bold mb-3 text-blue-700 dark:text-blue-400">
                            <HelpCircle className="h-5 w-5" />
                            Comentário da Questão:
                        </div>
                        <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questao.explicacao}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </CardContent>

            {!isInteractionDisabled && (
                <CardFooter className="flex justify-between border-t bg-muted/5 pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleVerGabarito}
                        className="text-muted-foreground hover:text-foreground"
                        size="sm"
                    >
                        <Eye className="mr-2 h-4 w-4" /> Ver Gabarito
                    </Button>
                    <Button
                        onClick={handleConfirmar}
                        disabled={!selecionada}
                        className="px-8 font-semibold shadow-sm"
                    >
                        Confirmar <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
