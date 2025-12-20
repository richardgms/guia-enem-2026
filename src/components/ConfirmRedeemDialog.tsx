'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Gift, Coins, Loader2 } from 'lucide-react'
import type { Reward } from '@/data/rewards'

interface ConfirmRedeemDialogProps {
    reward: Reward
    saldo: number
    onConfirm: () => Promise<void>
    disabled?: boolean
}

export function ConfirmRedeemDialog({ reward, saldo, onConfirm, disabled }: ConfirmRedeemDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const canAfford = saldo >= reward.cost
    const saldoApos = saldo - reward.cost

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
            setOpen(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full"
                    disabled={disabled || !canAfford}
                    variant={canAfford ? "default" : "outline"}
                >
                    {canAfford ? (
                        <>
                            <Gift className="mr-2 h-4 w-4" /> Resgatar
                        </>
                    ) : (
                        <>
                            <Coins className="mr-2 h-4 w-4" /> Falta {reward.cost - saldo}
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">{reward.emoji}</span>
                        Confirmar Resgate
                    </DialogTitle>
                    <DialogDescription>
                        Você está prestes a resgatar este vale:
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-muted rounded-lg p-4">
                        <h4 className="font-semibold text-lg">{reward.title}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{reward.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span>Custo:</span>
                        <span className="font-bold text-primary flex items-center">
                            <Coins className="mr-1 h-4 w-4" />
                            {reward.cost} moedas
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span>Seu saldo atual:</span>
                        <span className="font-medium">{saldo} moedas</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2">
                        <span>Saldo após resgate:</span>
                        <span className={`font-bold ${saldoApos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {saldoApos} moedas
                        </span>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resgatando...
                            </>
                        ) : (
                            <>
                                <Gift className="mr-2 h-4 w-4" /> Confirmar Resgate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
