import { useState, useEffect, useCallback } from 'react'
import { getEstatisticas, getResgates, salvarResgate, getExtrato } from '@/lib/database'
import type { Estatisticas, Redemption, ExtratoItem } from '@/lib/database'
import { useToast } from '@/hooks/use-toast'

export function useEstatisticas() {
    const [stats, setStats] = useState<Estatisticas | null>(null)
    const [resgates, setResgates] = useState<Redemption[]>([])
    const [extrato, setExtrato] = useState<ExtratoItem[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchData = useCallback(async () => {
        try {
            const [statsData, resgatesData, extratoData] = await Promise.all([
                getEstatisticas(),
                getResgates(),
                getExtrato()
            ])
            setStats(statsData)
            setResgates(resgatesData)
            setExtrato(extratoData)
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const resgatarRecompensa = async (reward: { id: string, title: string, cost: number }) => {
        if (!stats) return

        if (stats.saldo < reward.cost) {
            toast({
                title: "Saldo insuficiente",
                description: `Você precisa de mais ${reward.cost - stats.saldo} moedas para resgatar este item.`,
                variant: "destructive"
            })
            return false
        }

        try {
            await salvarResgate(reward)

            // Atualiza localmente para feedback instantâneo
            toast({
                title: "Recompensa Resgatada! 🎉",
                description: `Você resgatou "${reward.title}". Aproveite!`,
            })

            await fetchData() // Recarrega dados oficiais
            return true
        } catch (error) {
            console.error('Erro ao resgatar:', error)
            toast({
                title: "Erro no resgate",
                description: "Não foi possível processar seu resgate. Tente novamente.",
                variant: "destructive"
            })
            return false
        }
    }

    return {
        stats,
        resgates,
        extrato,
        loading,
        refresh: fetchData,
        resgatarRecompensa
    }
}
