import { createClient } from "@/lib/supabase/server"
import { CalendarioMensal } from "@/components/CalendarioMensal"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"
import type { ProgressoDia } from "@/types/database"

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const progressos: Record<string, ProgressoDia> = {}
    if (user) {
        const { data: progressoDB } = await supabase
            .from('progresso')
            .select('*')
            .eq('user_id', user.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progressoDB?.forEach((p: any) => {
            progressos[p.data_id] = {
                dataId: p.data_id,
                concluido: p.concluido,
                autoAvaliacao: p.auto_avaliacao,
                questoesAcertadas: p.questoes_acertadas,
                questoesTotal: p.questoes_total,
                anotacoes: p.anotacoes
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
                <p className="text-muted-foreground">
                    Visualize sua jornada de estudos completa.
                </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6">
                <CalendarioMensal
                    conteudos={conteudosData.conteudos as ConteudoDia[]}
                    progressos={progressos}
                />
            </div>
        </div>
    )
}