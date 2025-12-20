'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, TrendingUp, TrendingDown } from "lucide-react"
import type { ExtratoItem } from "@/lib/database"

interface ExtratoDialogProps {
    items: ExtratoItem[]
}

export function ExtratoDialog({ items }: ExtratoDialogProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-[#082F49] border-[#082F49] hover:bg-slate-100">
                    <History className="h-4 w-4" />
                    Ver Extrato
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Histórico de Moedas</DialogTitle>
                    <DialogDescription>
                        Acompanhe seus ganhos e gastos de moedas.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] w-full pr-4">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhuma movimentação registrada.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${item.tipo === 'ganho'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {item.tipo === 'ganho' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm leading-none">{item.descricao}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(item.data)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${item.tipo === 'ganho' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {item.tipo === 'ganho' ? '+' : '-'}{item.valor}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
