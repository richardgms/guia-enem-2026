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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 lg:p-8">
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Welcome Section */}
                    <section aria-labelledby="welcome-heading">
                        <h1 className="text-4xl font-normal text-primary" id="welcome-heading">
                            Olá, <span className="font-bold capitalize">{nomeUsuario}!</span> 👋
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Pronto para dominar o ENEM 2026? Vamos lá!
                        </p>
                    </section>

                    {/* Today Focus Section */}
                    <section aria-labelledby="today-focus-heading">
                        <div className="flex justify-between items-baseline mb-4">
                            <h2 className="text-2xl font-semibold" id="today-focus-heading">Seu foco de hoje</h2>
                            <span className="text-sm text-muted-foreground font-medium">Dia {todaysIndex + 1} de {totalDias}</span>
                        </div>

                        {todayContent ? (
                            <div className="bg-accent-green-bg shadow-custom rounded-2xl p-6 border border-card-border flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden gap-4">
                                <div className="border-l-4 border-accent-green-button pl-4">
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </p>
                                    <h3 className="text-2xl font-bold mt-1 text-primary">{todayContent.assunto}</h3>
                                    <div className="flex items-center space-x-3 mt-3 text-sm flex-wrap gap-y-2">
                                        <span className="bg-tag-math-bg text-tag-math-text px-3 py-1 rounded-full font-medium capitalize">
                                            {todayContent.materia}
                                        </span>
                                        <span className="bg-tag-easy-bg text-tag-easy-text px-3 py-1 rounded-full font-medium">
                                            Essencial
                                        </span>
                                        <span className="flex items-center text-muted-foreground font-medium">
                                            ⏱️ 45min
                                        </span>
                                    </div>
                                </div>

                                <Link href={`/dia/${todayContent.data}`} className="w-full md:w-auto">
                                    <Button className="w-full md:w-auto bg-accent-green-button text-header-bg font-semibold px-6 py-2 rounded-full hover:bg-[#28BFAA] transition-colors border-none">
                                        Começar Agora
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-accent-green-bg shadow-custom rounded-2xl p-8 border border-card-border text-center">
                                <h3 className="text-2xl font-bold text-accent-green-text">Parabéns! 🎉</h3>
                                <p className="text-muted-foreground mt-2">Você completou todo o cronograma!</p>
                            </div>
                        )}
                    </section>

                    {/* Next Steps Section */}
                    <section aria-labelledby="next-steps-heading">
                        <h2 className="text-2xl font-semibold mb-4" id="next-steps-heading">Próximos passos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {nextDays.map((day) => (
                                <div key={day.id} className="bg-white shadow-custom rounded-2xl p-5 border border-card-border hover:shadow-lg transition-shadow">
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(day.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    </p>
                                    <h3 className="font-semibold mt-1 text-lg text-primary line-clamp-2 min-h-[3.5rem]">{day.assunto}</h3>
                                    <div className="mt-3">
                                        <span className="bg-tag-math-bg text-tag-math-text px-3 py-1 rounded-full font-medium text-xs capitalize">
                                            {day.materia}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {nextDays.length === 0 && (
                                <p className="text-muted-foreground text-sm col-span-3 text-center py-8 bg-white rounded-xl border">
                                    Sem mais atividades previstas.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white shadow-custom rounded-2xl p-4 border border-card-border flex items-center space-x-4">
                            <Trophy className="h-8 w-8 text-slate-500" />
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">NÍVEL</p>
                                <p className="font-bold text-lg text-primary">Iniciante</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-custom rounded-2xl p-4 border border-card-border">
                            <p className="text-xs text-muted-foreground font-medium uppercase">XP TOTAL</p>
                            <p className="font-bold text-lg mt-1 text-primary">{stats.xpTotal} XP</p>
                        </div>
                    </div>

                    {/* Streak Card */}
                    <Streak dias={stats.streakAtual} maiorStreak={stats.maiorStreak} />

                    {/* Progress Card */}
                    <div className="bg-white shadow-custom rounded-2xl p-5 border border-card-border">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-primary">Progresso Geral</h3>
                            </div>
                            <span className="font-bold text-sm text-primary">{Math.round((diasConcluidos / totalDias) * 100) || 0}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Cronograma completo</p>

                        <ProgressBar current={diasConcluidos} total={totalDias} label="" />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-100 rounded-lg p-3 text-center">
                                <p className="font-bold text-2xl text-primary">{diasConcluidos}</p>
                                <p className="text-xs text-muted-foreground">Dias Concluídos</p>
                            </div>
                            <div className="bg-slate-100 rounded-lg p-3 text-center">
                                <p className="font-bold text-2xl text-primary">{totalDias - diasConcluidos}</p>
                                <p className="text-xs text-muted-foreground">Dias Restantes</p>
                            </div>
                        </div>
                    </div>

                    {/* Visão Geral CTA */}
                    <div className="bg-header-bg text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold">Visão Geral</h3>
                        <p className="text-sm opacity-80 mt-1">Veja seu planejamento mensal completo.</p>
                        <Link href="/calendario" className="mt-4 w-full bg-white text-header-bg font-bold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <span>Ver Calendário →</span>
                        </Link>
                    </div>
                </aside>
            </main>
        </div>
    )
}
