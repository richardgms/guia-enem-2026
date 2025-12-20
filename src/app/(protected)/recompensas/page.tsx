'use client'

import { REWARDS } from '@/data/rewards'
import { useEstatisticas } from '@/hooks/useEstatisticas'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Loader2 } from 'lucide-react'
import { ExtratoDialog } from '@/components/ExtratoDialog'
import { ConfirmRedeemDialog } from '@/components/ConfirmRedeemDialog'
import { MeusValesDialog } from '@/components/MeusValesDialog'

export default function RecompensasPage() {
    const { stats, loading, resgatarRecompensa, extrato, resgates, refresh } = useEstatisticas()

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const saldo = stats?.saldo || 0

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Loja de Recompensas</h2>
                    <p className="text-muted-foreground">
                        Troque suas moedas de estudo por mimos reais!
                    </p>
                </div>
                <Card className="w-full md:w-auto bg-primary text-primary-foreground border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:gap-8">
                        <CardTitle className="text-sm font-medium">
                            Seu Saldo
                        </CardTitle>
                        <Coins className="h-4 w-4 text-primary-foreground/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{saldo} Moedas</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <ExtratoDialog items={extrato} />
                            <MeusValesDialog resgates={resgates} onValeUsado={refresh} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {REWARDS.map((reward) => {
                    const canAfford = saldo >= reward.cost

                    return (
                        <Card key={reward.id} className={`flex flex-col ${!canAfford ? 'opacity-80' : ''}`}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="text-4xl mb-2">{reward.emoji}</div>
                                    <Badge variant={canAfford ? "default" : "secondary"}>
                                        <Coins className="mr-1 h-3 w-3" />
                                        {reward.cost}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-2">{reward.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {reward.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    {reward.category}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <ConfirmRedeemDialog
                                    reward={reward}
                                    saldo={saldo}
                                    onConfirm={() => resgatarRecompensa(reward)}
                                    disabled={!canAfford}
                                />
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
