"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, Save } from "lucide-react"
import type { ConteudoDia } from "@/types"
import type { ProgressoDia } from "@/types/database"
import { getProgresso, salvarProgresso } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResumoCard } from "@/components/ResumoCard"
import { cn } from "@/lib/utils"
import { VideoCard } from "@/components/VideoCard"
import { QuestaoCard } from "@/components/QuestaoCard"
import { useToast } from "@/hooks/use-toast"

interface DayContentProps {
    conteudo: ConteudoDia
}

import { materiaColors, materiaLabels, dificuldadeColors, dificuldadeLabels } from "@/lib/constants"

export function DayContent({ conteudo }: DayContentProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [progresso, setProgresso] = useState<ProgressoDia>({
        dataId: conteudo.data,
        concluido: false,
        questoesAcertadas: 0,
        questoesTotal: conteudo.questoes.length,
        anotacoes: ""
    })

    // Carregar progresso inicial
    useEffect(() => {
        async function load() {
            try {
                const data = await getProgresso(conteudo.data)
                if (data) {
                    setProgresso(data)
                }
            } catch (error) {
                console.error("Erro ao carregar progresso:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [conteudo.data])

    const handleResponderQuestao = (questaoIndex: number, acertou: boolean) => {
        // Lógica simples: incrementa acertadas se acertou
        // Em um app real, idealmente rastrearíamos quais questões foram acertadas individualmente
        // Aqui vamos apenas atualizar o contador se a questão ainda não tiver sido contabilizada? 
        // Simplificação: recalculamos baseados no estado atual

        // Melhor abordagem: salvar respostas locais ou apenas confiar no contador do usuário?
        // O PRD pede "Contador de acertos" na autoavaliação, que parece ser manual ou derivado.
        // O QuestaoCard já nos diz se acertou. Vamos somar.
        if (acertou) {
            setProgresso(prev => ({
                ...prev,
                questoesAcertadas: Math.min(prev.questoesAcertadas + 1, prev.questoesTotal)
            }))
        }
    }

    const handleSalvar = async () => {
        setSaving(true)
        try {
            const novoProgresso = {
                ...progresso,
                concluido: true,
                dataRevisao: calculateReviewDate(progresso.autoAvaliacao)
            }

            await salvarProgresso(conteudo.data, novoProgresso)
            setProgresso(novoProgresso)

            toast({
                title: "Progresso salvo!",
                description: "Continue assim 🔥",
                variant: "default", // success não existe no default, usar default ou criar variant
                className: "bg-green-600 text-white"
            })

            router.refresh() // Atualiza dados server-side (streak etc)
        } catch (error) {
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const calculateReviewDate = (avaliacao?: string) => {
        const hoje = new Date()
        // Lógica simples de revisão espaçada
        if (avaliacao === 'nao_entendi') return addDays(hoje, 1).toISOString() // Revisar amanhã
        if (avaliacao === 'preciso_revisar') return addDays(hoje, 3).toISOString() // 3 dias
        if (avaliacao === 'entendi_bem') return addDays(hoje, 7).toISOString() // 7 dias
        return undefined
    }

    const addDays = (date: Date, days: number) => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }

    if (loading) {
        return <div className="p-8 flex justify-center text-muted-foreground">Carregando seus estudos...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Info */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground" onClick={() => router.back()}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
                </Button>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{conteudo.data.split('-').reverse().join('/')}</span>
                        <span>•</span>
                        <span className="capitalize">{conteudo.diaSemana}</span>
                    </div>
                    <h1 className="text-3xl font-bold">{conteudo.assunto}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={cn("px-3 py-1 text-sm", materiaColors[conteudo.materia])}>
                            {materiaLabels[conteudo.materia] || conteudo.materia}
                        </Badge>
                        <Badge variant="outline" className={cn("px-3 py-1 text-sm", dificuldadeColors[conteudo.dificuldade])}>
                            {dificuldadeLabels[conteudo.dificuldade] || conteudo.dificuldade}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                            ⏱️ {conteudo.tempoEstimado}
                        </Badge>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Resumo */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    📖 Resumo
                </h2>
                <ResumoCard resumo={conteudo.resumo} assunto={conteudo.assunto} />
            </section>

            {/* Vídeos */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    🎬 Videoaulas Recomendadas
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {conteudo.videos.map((vid, idx) => (
                        <VideoCard key={idx} video={vid} />
                    ))}
                    {conteudo.videos.length === 0 && (
                        <p className="text-muted-foreground italic">Nenhum vídeo cadastrado para hoje.</p>
                    )}
                </div>
            </section>

            {/* Questões */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    ✍️ Questões ({conteudo.questoes.length})
                </h2>
                <div className="space-y-8">
                    {conteudo.questoes.map((q, idx) => (
                        <div key={q.id}>
                            <p className="text-sm font-bold text-muted-foreground mb-2">Questão {idx + 1}</p>
                            <QuestaoCard
                                questao={q}
                                onResponder={(acertou) => handleResponderQuestao(idx, acertou)}
                                respondida={progresso.concluido}
                                numero={idx + 1}
                                total={conteudo.questoes.length}
                            />
                        </div>
                    ))}
                    {conteudo.questoes.length === 0 && (
                        <p className="text-muted-foreground italic">Nenhuma questão cadastrada para hoje.</p>
                    )}
                </div>
            </section>

            <Separator />

            {/* Autoavaliação e Conclusão */}
            <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border space-y-6">
                <h2 className="text-xl font-bold">📊 Como foi seu estudo?</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-base">Quantas questões você acertou?</Label>
                            <div className="flex items-center gap-3 mt-2">
                                <Button
                                    variant="outline" size="icon"
                                    onClick={() => setProgresso(p => ({ ...p, questoesAcertadas: Math.max(0, p.questoesAcertadas - 1) }))}
                                >-</Button>
                                <span className="text-2xl font-bold w-8 text-center">{progresso.questoesAcertadas}</span>
                                <Button
                                    variant="outline" size="icon"
                                    onClick={() => setProgresso(p => ({ ...p, questoesAcertadas: Math.min(p.questoesTotal, p.questoesAcertadas + 1) }))}
                                >+</Button>
                                <span className="text-muted-foreground ml-2">de {progresso.questoesTotal}</span>
                            </div>
                        </div>

                        <div>
                            <Label className="text-base mb-2 block">O que você achou do conteúdo?</Label>
                            <RadioGroup
                                value={progresso.autoAvaliacao || ""}
                                onValueChange={(val: string) => setProgresso(p => ({ ...p, autoAvaliacao: val as any }))}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="entendi_bem" id="r1" />
                                    <Label htmlFor="r1">Entendi bem ✅</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="preciso_revisar" id="r2" />
                                    <Label htmlFor="r2">Preciso revisar ⚠️</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="nao_entendi" id="r3" />
                                    <Label htmlFor="r3">Não entendi nada ❌</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas">Minhas Anotações</Label>
                        <Textarea
                            id="notas"
                            placeholder="Escreva aqui seus pontos principais..."
                            className="h-32"
                            value={progresso.anotacoes || ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgresso(p => ({ ...p, anotacoes: e.target.value }))}
                        />
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full text-lg h-14 gap-2"
                    onClick={handleSalvar}
                    disabled={saving}
                >
                    {saving ? "Salvando..." : (
                        <>
                            <CheckCircle className="h-6 w-6" />
                            {progresso.concluido ? "Atualizar Progresso" : "MARCAR COMO CONCLUÍDO"}
                        </>
                    )}
                </Button>
            </section>
        </div>
    )
}
