import { notFound } from "next/navigation"
import { DayContent } from "@/components/DayContent"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"

interface PageProps {
    params: Promise<{
        date: string
    }>
}

// Em Next.js 15+, params é uma Promise.

export default async function DayPage({ params }: PageProps) {
    const { date } = await params
    // Buscar no JSON
    const conteudo = conteudosData.conteudos.find(c => c.data === date)

    if (!conteudo) {
        notFound()
    }

    // Passar para Client Component
    return (
        <div className="max-w-4xl mx-auto">
            <DayContent conteudo={conteudo as ConteudoDia} />
        </div>
    )
}