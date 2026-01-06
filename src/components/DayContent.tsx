"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, Save, Pencil, X } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DayContentProps {
    conteudo: ConteudoDia
}

import { materiaColors, materiaLabels, dificuldadeColors, dificuldadeLabels } from "@/lib/constants"
import { podeConcluirTarefa, getHojeBrasil } from "@/lib/studyProgress"

export function DayContent({ conteudo }: DayContentProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Verificar restrição de revisão
    const hoje = getHojeBrasil()
    const permissaoTarefa = podeConcluirTarefa(conteudo, hoje)

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

    const handleSalvar = () => {
        // Abre modal de confirmação
        setShowConfirmModal(true)
    }

    const handleConfirmSave = async () => {
        console.log('=== handleConfirmSave iniciado ===')
        console.log('Progresso atual:', progresso)

        setShowConfirmModal(false)
        setSaving(true)
        try {
            const novoProgresso = {
                ...progresso,
                concluido: true,
                dataRevisao: undefined
            }

            await salvarProgresso(conteudo.data, novoProgresso)
            console.log('Progresso salvo com sucesso!')

            setProgresso(novoProgresso)
            setIsEditing(false)

            toast({
                title: "Progresso salvo!",
                description: "Continue assim 🔥",
                variant: "default",
                className: "bg-green-600 text-white"
            })

            // Redireciona para dashboard
            window.location.href = '/dashboard'
        } catch (error) {
            console.error("=== ERRO ao salvar progresso ===", error)
            toast({
                title: "Erro ao salvar",
                description: error instanceof Error ? error.message : "Tente novamente.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const getAvaliacaoLabel = (avaliacao?: string) => {
        if (avaliacao === 'entendi_bem') return { texto: 'Entendi bem', emoji: '✅', cor: 'text-green-600 bg-green-50' }
        if (avaliacao === 'preciso_revisar') return { texto: 'Preciso revisar', emoji: '⚠️', cor: 'text-amber-600 bg-amber-50' }
        if (avaliacao === 'nao_entendi') return { texto: 'Não entendi', emoji: '❌', cor: 'text-red-600 bg-red-50' }
        return { texto: 'Não avaliado', emoji: '❓', cor: 'text-slate-500 bg-slate-50' }
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
            <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-primary">📊 Como foi seu estudo?</h2>
                    {progresso.concluido && !isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Editar
                        </Button>
                    )}
                </div>

                {/* Card Compacto - quando já avaliado e não está editando */}
                {progresso.concluido && !isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Acertos */}
                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-slate-500 mb-1">Acertos</p>
                                <p className="text-2xl font-bold text-primary">
                                    {progresso.questoesAcertadas}/{progresso.questoesTotal}
                                </p>
                            </div>
                            {/* Status */}
                            <div className={cn("rounded-xl p-4 text-center", getAvaliacaoLabel(progresso.autoAvaliacao).cor)}>
                                <p className="text-sm opacity-70 mb-1">Status</p>
                                <p className="text-lg font-bold flex items-center justify-center gap-2">
                                    <span>{getAvaliacaoLabel(progresso.autoAvaliacao).emoji}</span>
                                    {getAvaliacaoLabel(progresso.autoAvaliacao).texto}
                                </p>
                            </div>
                            {/* Revisão */}
                            <div className={cn(
                                "rounded-xl p-4 text-center",
                                progresso.autoAvaliacao === 'entendi_bem' ? 'bg-green-50' : 'bg-amber-50'
                            )}>
                                <p className="text-sm opacity-70 mb-1">Revisão</p>
                                <p className="text-lg font-bold">
                                    {progresso.autoAvaliacao === 'entendi_bem' ? '✓ Dominei' : '📚 Pendente'}
                                </p>
                            </div>
                        </div>
                        {progresso.anotacoes && (
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-sm text-slate-500 mb-1">📝 Minhas Anotações</p>
                                <p className="text-slate-700">{progresso.anotacoes}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Formulário de Edição */
                    <>
                        {/* Acertos */}
                        <div>
                            <Label className="text-base font-medium text-slate-700">Quantas questões você acertou?</Label>
                            <div className="flex items-center gap-3 mt-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-2 hover:bg-slate-100"
                                    onClick={() => setProgresso(p => ({ ...p, questoesAcertadas: Math.max(0, p.questoesAcertadas - 1) }))}
                                >-</Button>
                                <span className="text-3xl font-bold w-12 text-center text-primary">{progresso.questoesAcertadas}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full border-2 hover:bg-slate-100"
                                    onClick={() => setProgresso(p => ({ ...p, questoesAcertadas: Math.min(p.questoesTotal, p.questoesAcertadas + 1) }))}
                                >+</Button>
                                <span className="text-muted-foreground font-medium">de {progresso.questoesTotal}</span>
                            </div>
                        </div>

                        {/* Avaliação - Cards Clicáveis */}
                        <div>
                            <Label className="text-base font-medium text-slate-700 mb-3 block">O que você achou do conteúdo?</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setProgresso(p => ({ ...p, autoAvaliacao: 'entendi_bem' }))}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all text-left",
                                        progresso.autoAvaliacao === 'entendi_bem'
                                            ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200"
                                            : "border-slate-200 hover:border-green-300 hover:bg-green-50/50"
                                    )}
                                >
                                    <div className="text-2xl mb-1">✅</div>
                                    <div className="font-semibold text-slate-800">Entendi bem</div>
                                    <div className="text-xs text-slate-500 mt-1">Dominei o conteúdo</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProgresso(p => ({ ...p, autoAvaliacao: 'preciso_revisar' }))}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all text-left",
                                        progresso.autoAvaliacao === 'preciso_revisar'
                                            ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-200"
                                            : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                                    )}
                                >
                                    <div className="text-2xl mb-1">⚠️</div>
                                    <div className="font-semibold text-slate-800">Preciso revisar</div>
                                    <div className="text-xs text-slate-500 mt-1">Entendi parcialmente</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProgresso(p => ({ ...p, autoAvaliacao: 'nao_entendi' }))}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all text-left",
                                        progresso.autoAvaliacao === 'nao_entendi'
                                            ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-200"
                                            : "border-slate-200 hover:border-red-300 hover:bg-red-50/50"
                                    )}
                                >
                                    <div className="text-2xl mb-1">❌</div>
                                    <div className="font-semibold text-slate-800">Não entendi</div>
                                    <div className="text-xs text-slate-500 mt-1">Preciso estudar de novo</div>
                                </button>
                            </div>
                        </div>

                        {/* Anotações */}
                        <div className="space-y-2">
                            <Label htmlFor="notas" className="text-base font-medium text-slate-700">Minhas Anotações</Label>
                            <Textarea
                                id="notas"
                                placeholder="Escreva aqui seus pontos principais, dúvidas ou o que precisa revisar..."
                                className="h-28 resize-none"
                                value={progresso.anotacoes || ""}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgresso(p => ({ ...p, anotacoes: e.target.value }))}
                            />
                        </div>

                        {/* Aviso de revisão bloqueada */}
                        {!permissaoTarefa.permitido && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <span className="text-amber-600 text-xl">🔒</span>
                                <div>
                                    <p className="font-medium text-amber-800">Revisão Bloqueada</p>
                                    <p className="text-sm text-amber-700 mt-1">{permissaoTarefa.motivo}</p>
                                </div>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-3">
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 h-14"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <X className="h-5 w-5 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                            <Button
                                size="lg"
                                className={cn("h-14 gap-2", isEditing ? "flex-1" : "w-full")}
                                onClick={handleSalvar}
                                disabled={saving || !permissaoTarefa.permitido || !progresso.autoAvaliacao}
                            >
                                {saving ? "Salvando..." : !permissaoTarefa.permitido ? (
                                    <>
                                        <span>🔒</span>
                                        Aguarde o dia da revisão
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-6 w-6" />
                                        {progresso.concluido ? "Salvar Alterações" : "Marcar como Concluído"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </section>

            {/* Modal de Confirmação */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">✓ Confirmar Avaliação</DialogTitle>
                        <DialogDescription>
                            Revise os dados antes de salvar
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-slate-500 mb-1">Acertos</p>
                                <p className="text-xl font-bold text-primary">
                                    {progresso.questoesAcertadas}/{progresso.questoesTotal}
                                </p>
                            </div>
                            <div className={cn("rounded-lg p-3 text-center", getAvaliacaoLabel(progresso.autoAvaliacao).cor)}>
                                <p className="text-xs opacity-70 mb-1">Status</p>
                                <p className="font-bold flex items-center justify-center gap-1">
                                    <span>{getAvaliacaoLabel(progresso.autoAvaliacao).emoji}</span>
                                    {getAvaliacaoLabel(progresso.autoAvaliacao).texto}
                                </p>
                            </div>
                        </div>
                        {progresso.anotacoes && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Anotações</p>
                                <p className="text-sm text-slate-700 line-clamp-2">{progresso.anotacoes}</p>
                            </div>
                        )}
                        {progresso.autoAvaliacao !== 'entendi_bem' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                <p className="text-sm text-amber-700">
                                    📚 Este conteúdo aparecerá na página de <strong>Revisões</strong>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                            Voltar
                        </Button>
                        <Button onClick={handleConfirmSave} disabled={saving} className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
