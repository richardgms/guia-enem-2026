import { createClient } from "@/lib/supabase/server"
import { DayCard } from "@/components/DayCard"
import conteudosData from "@/data/conteudos.json"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default async function RevisaoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const revisoes: any[] = []

    if (user) {
        // Buscar onde auto_avaliacao é preciso_revisar ou nao_entendi
        const { data: progressoDB } = await supabase
            .from('progresso')
            .select('*')
            .eq('user_id', user.id)
            .in('auto_avaliacao', ['preciso_revisar', 'nao_entendi'])

        progressoDB?.forEach(p => {
            const content = conteudosData.conteudos.find(c => c.id === p.data_id)
            if (content) {
                revisoes.push({
                    content,
                    progresso: p
                })
            }
        })
    }

    // Ordenar (ex: data mais antiga primeiro?)
    revisoes.sort((a, b) => a.content.data.localeCompare(b.content.data))

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Revisão Pendente</h1>
                <p className="text-muted-foreground">
                    Assuntos que você marcou que precisam de reforço.
                </p>
            </div>

            {revisoes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {revisoes.map(({ content, progresso }) => (
                        <div key={content.id} className="relative">
                            <div className="absolute -top-2 -right-2 z-10 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 round-full border border-yellow-200 rounded-full font-bold shadow-sm flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {progresso.auto_avaliacao === 'nao_entendi' ? 'Reforço Urgente' : 'Revisar'}
                            </div>
                            <DayCard conteudo={content as any} progresso={progresso} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold text-foreground">Tudo limpo! 🎉</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        Você não tem revisões pendentes no momento. Continue avançando no cronograma!
                    </p>
                </div>
            )}
        </div>
    )
}