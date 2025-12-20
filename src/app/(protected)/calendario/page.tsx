import { createClient } from "@/lib/supabase/server"
import { CalendarioMensal } from "@/components/CalendarioMensal"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"
import type { ProgressoDia } from "@/types/database"

export const dynamic = 'force-dynamic'

// Interface para provas realizadas
interface ProvaRealizada {
    semana: number
    finalizadaEm: string
}

export default async function CalendarioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const progressos: Record<string, ProgressoDia> = {}
    const provasRealizadas: ProvaRealizada[] = []

    if (user) {
        // Buscar progressos
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

        // Buscar provas finalizadas
        const { data: provasDB } = await supabase
            .from('provas_semanais')
            .select('semana, finalizada_em')
            .eq('user_id', user.id)
            .eq('status', 'finalizada')

        provasDB?.forEach((p) => {
            provasRealizadas.push({
                semana: p.semana,
                finalizadaEm: p.finalizada_em
            })
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
                    provasRealizadas={provasRealizadas}
                />
            </div>
        </div>
    )
}