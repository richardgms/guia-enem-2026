'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Ticket, Check, Loader2, Gift, Calendar, Clock } from 'lucide-react'
import type { Redemption } from '@/types/database'
import { usarVale } from '@/lib/database'
import { useToast } from '@/hooks/use-toast'

interface MeusValesDialogProps {
    resgates: Redemption[]
    onValeUsado: () => void
}

export function MeusValesDialog({ resgates, onValeUsado }: MeusValesDialogProps) {
    const [open, setOpen] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const { toast } = useToast()

    const valesDisponiveis = resgates.filter(r => !r.usedAt)
    const valesUsados = resgates.filter(r => r.usedAt)

    const handleUsarVale = async (redemption: Redemption) => {
        setLoadingId(redemption.id)
        try {
            await usarVale(redemption.id)
            toast({
                title: "Vale usado! 🎉",
                description: `Você usou o vale "${redemption.rewardTitle}". Aproveite!`,
            })
            onValeUsado()
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível usar o vale. Tente novamente.",
                variant: "destructive"
            })
        } finally {
            setLoadingId(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-[#082F49] border-[#082F49] hover:bg-slate-100">
                    <Ticket className="h-4 w-4" />
                    Meus Vales ({valesDisponiveis.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        Meus Vales
                    </DialogTitle>
                    <DialogDescription>
                        Vales resgatados e disponíveis para uso
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    {valesDisponiveis.length === 0 && valesUsados.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Você ainda não resgatou nenhum vale.</p>
                            <p className="text-sm mt-2">Estude e ganhe moedas para trocar por recompensas!</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pr-4">
                            {/* Vales Disponíveis */}
                            {valesDisponiveis.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <Gift className="h-4 w-4" />
                                        Disponíveis ({valesDisponiveis.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {valesDisponiveis.map((vale) => (
                                            <div
                                                key={vale.id}
                                                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{vale.rewardTitle}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Comprado em {formatDate(vale.redeemedAt)}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUsarVale(vale)}
                                                        disabled={loadingId === vale.id}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {loadingId === vale.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Check className="mr-1 h-4 w-4" /> Usar
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Vales Usados */}
                            {valesUsados.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Histórico ({valesUsados.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {valesUsados.map((vale) => (
                                            <div
                                                key={vale.id}
                                                className="bg-slate-50 border border-slate-200 rounded-lg p-3 opacity-70"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-medium text-sm line-through">{vale.rewardTitle}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Comprado: {formatDate(vale.redeemedAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                Usado: {formatDate(vale.usedAt!)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Usado
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
