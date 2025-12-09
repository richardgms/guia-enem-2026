import { notFound } from "next/navigation"
import { DayContent } from "@/components/DayContent"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"

interface PageProps {
    params: {
        date: string
    }
}

// Em Next.js 14, params é uma Promise se não for usado "use client" diretamente ou dependendo da config
// Mas o padrão mais simples é receber como props. 
// Para Server Components, params é um objeto.

export default async function DayPage({ params }: PageProps) {
    // Buscar no JSON
    const conteudo = conteudosData.conteudos.find(c => c.data === params.date)

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