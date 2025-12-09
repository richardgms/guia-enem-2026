import { createClient } from "@/lib/supabase/server"
import { DayCard } from "@/components/DayCard"
import { ProgressBar } from "@/components/ProgressBar"
import { Streak } from "@/components/Streak"
import conteudosData from "@/data/conteudos.json"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"
import type { ConteudoDia } from "@/types"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Buscar estatísticas diretamente do DB
    let stats = {
        xpTotal: 0,
        streakAtual: 0,
        maiorStreak: 0,
        diasConcluidos: 0
    }

    if (user) {
        const { data: statsDB } = await supabase
            .from('estatisticas')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (statsDB) {
            stats = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                xpTotal: (statsDB as any).xp_total,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                streakAtual: (statsDB as any).streak_atual,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                maiorStreak: (statsDB as any).maior_streak,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                diasConcluidos: (statsDB as any).dias_concluidos
            }
        }
    }

    // Buscar todos os progressos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressos: Record<string, any> = {}
    if (user) {
        const { data: progressoDB } = await supabase
            .from('progresso')
            .select('*')
            .eq('user_id', user.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progressoDB?.forEach((p: any) => {
            progressos[p.data_id] = {
                concluido: p.concluido
            }
        })
    }

    // Calcular progresso geral
    const totalDias = conteudosData.conteudos.length
    const diasConcluidos = stats.diasConcluidos

    // Encontrar dia atual e próximos
    const hoje = new Date().toISOString().split('T')[0]

    let todaysIndex = conteudosData.conteudos.findIndex(c => c.data === hoje)

    if (todaysIndex === -1) {
        todaysIndex = conteudosData.conteudos.findIndex(c => !progressos[c.id]?.concluido)
    }

    if (todaysIndex === -1 && diasConcluidos > 0) {
        todaysIndex = conteudosData.conteudos.length - 1
    }

    if (todaysIndex === -1) todaysIndex = 0

    const todayContent = conteudosData.conteudos[todaysIndex]
    const nextDays = conteudosData.conteudos.slice(todaysIndex + 1, todaysIndex + 4)

    const nomeUsuario = user?.email?.split('@')[0] || "Estudante"

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Olá, <span className="text-primary capitalize">{nomeUsuario}</span>! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Pronta para dominar o ENEM 2026? Vamos lá!
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Nível</span>
                            <span className="text-sm font-bold leading-none">Iniciante</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="px-3 py-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">XP Total</span>
                        <span className="text-sm font-bold text-primary leading-none">{stats.xpTotal} XP</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Main Content - Left Column */}
                <div className="md:col-span-8 space-y-6">

                    {/* Card do Dia Principal */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Seu foco de hoje</h2>
                            <span className="text-sm text-muted-foreground">Dia {todaysIndex + 1} de {totalDias}</span>
                        </div>

                        {todayContent ? (
                            <div className="transform transition-all hover:scale-[1.01]">
                                <DayCard
                                    conteudo={todayContent as ConteudoDia}
                                    progresso={progressos[todayContent.id]}
                                />
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                                Cronograma finalizado! Parabéns! 🎉
                            </div>
                        )}
                    </section>

                    {/* Próximos dias */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Próximos passos</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {nextDays.map(day => (
                                <DayCard
                                    key={day.id}
                                    conteudo={day as ConteudoDia}
                                    progresso={progressos[day.id]}
                                    compact
                                />
                            ))}
                            {nextDays.length === 0 && (
                                <p className="text-muted-foreground text-sm col-span-3">
                                    Você está em dia com o cronograma!
                                </p>
                            )}
                        </div>
                    </section>

                </div>

                {/* Sidebar - Right Column */}
                <div className="md:col-span-4 space-y-6">

                    {/* Streak Card */}
                    <Streak dias={stats.streakAtual} maiorStreak={stats.maiorStreak} />

                    {/* Progresso Geral */}
                    <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            📊 Progresso Geral
                        </h3>
                        <ProgressBar
                            current={diasConcluidos}
                            total={totalDias > 0 ? totalDias : 1}
                            label="Cronograma completo"
                        />
                        <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                            <div className="bg-muted p-2 rounded">
                                <span className="block font-bold text-lg text-green-600">{diasConcluidos}</span>
                                <span className="text-muted-foreground">Dias Concluídos</span>
                            </div>
                            <div className="bg-muted p-2 rounded">
                                <span className="block font-bold text-lg text-blue-600">{totalDias - diasConcluidos}</span>
                                <span className="text-muted-foreground">Dias Restantes</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Link para Calendário */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-md">
                        <h3 className="font-bold text-lg mb-1">Visão Geral</h3>
                        <p className="text-indigo-100 text-sm mb-4">Veja seu planejamento mensal completo.</p>
                        <Button variant="secondary" className="w-full text-indigo-700 hover:text-indigo-800" asChild>
                            <Link href="/calendario">
                                Ver Calendário <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
