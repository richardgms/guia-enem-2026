import { createClient } from "@/lib/supabase/server"
import { ProgressBar } from "@/components/ProgressBar"
import { Streak } from "@/components/Streak"
import conteudosData from "@/data/conteudos.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Target, Brain, TrendingUp } from "lucide-react"

export default async function EstatisticasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Buscar estatísticas
    let stats = {
        xpTotal: 0,
        streakAtual: 0,
        maiorStreak: 0,
        diasConcluidos: 0
    }

    if (user) {
        const { data: statsDB } = await supabase.from('estatisticas').select('*').eq('user_id', user.id).single()
        if (statsDB) {
            stats = {
                xpTotal: statsDB.xp_total,
                streakAtual: statsDB.streak_atual,
                maiorStreak: statsDB.maior_streak,
                diasConcluidos: statsDB.dias_concluidos
            }
        }
    }

    // Cálculos adicionais (desempenho por matéria)
    const materiasStats: Record<string, { total: number, concluidos: number }> = {}

    conteudosData.conteudos.forEach(c => {
        if (!materiasStats[c.materia]) materiasStats[c.materia] = { total: 0, concluidos: 0 }
        materiasStats[c.materia].total += 1
    })

    // Buscar progressos para preencher
    if (user) {
        const { data: progressoDB } = await supabase.from('progresso').select('data_id, concluido').eq('user_id', user.id).eq('concluido', true)

        progressoDB?.forEach(p => {
            const content = conteudosData.conteudos.find(c => c.id === p.data_id)
            if (content && materiasStats[content.materia]) {
                materiasStats[content.materia].concluidos += 1
            }
        })
    }

    // Dias até o ENEM (Estimado para 04/11/2026)
    const enemDate = new Date('2026-11-04')
    const today = new Date()
    const daysLeft = Math.ceil((enemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="space-y-8 animate-in fade-in pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
                <p className="text-muted-foreground">
                    Acompanhe seu desempenho rumo à aprovação.
                </p>
            </div>

            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dias Concluídos</CardTitle>
                        <CheckIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.diasConcluidos}</div>
                        <p className="text-xs text-muted-foreground">de {conteudosData.conteudos.length} totais</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Streak Atual</CardTitle>
                        <FlameIcon className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.streakAtual} dias</div>
                        <p className="text-xs text-muted-foreground">Recorde: {stats.maiorStreak} dias</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">XP Total</CardTitle>
                        <TrophyIcon className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.xpTotal}</div>
                        <p className="text-xs text-muted-foreground">Nível Iniciante</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dias até o ENEM</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{daysLeft}</div>
                        <p className="text-xs text-muted-foreground">04 Nov 2026</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Desempenho por Matéria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(materiasStats).map(([materia, stat]) => (
                            <div key={materia}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium capitalize">{materia}</span>
                                    <span className="text-sm text-muted-foreground">{stat.concluidos}/{stat.total}</span>
                                </div>
                                <ProgressBar current={stat.concluidos} total={stat.total || 1} showPercentage={false} className="h-2" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Conquistas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 text-center text-muted-foreground py-10">
                            <Target className="h-12 w-12 mx-auto opacity-20" />
                            <p>Em breve: sistema de conquistas detalhado!</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function CheckIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
function FlameIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a1 1 0 0 1 .9 2.5z" /></svg>
}
function TrophyIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
}
function CalendarIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
}