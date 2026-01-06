import { createClient } from "@/lib/supabase/server"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"
import Link from "next/link"
import { ArrowLeft, BookOpen, AlertTriangle, XCircle, ChevronRight } from "lucide-react"

export const dynamic = 'force-dynamic'

// Helper para labels das matérias
const materiaLabels: Record<string, string> = {
    'matematica': 'Matemática',
    'portugues': 'Português',
    'biologia': 'Biologia',
    'historia': 'História',
    'fisica': 'Física',
    'quimica': 'Química',
    'geografia': 'Geografia',
    'redacao': 'Redação',
    'revisao': 'Revisão'
}

// Helper para cores das matérias
const materiaColors: Record<string, string> = {
    'matematica': 'bg-blue-100 text-blue-700',
    'portugues': 'bg-purple-100 text-purple-700',
    'biologia': 'bg-cyan-100 text-cyan-700',
    'historia': 'bg-red-100 text-red-700',
    'fisica': 'bg-orange-100 text-orange-700',
    'quimica': 'bg-green-100 text-green-700',
    'geografia': 'bg-lime-100 text-lime-700',
    'redacao': 'bg-pink-100 text-pink-700',
    'revisao': 'bg-slate-100 text-slate-700'
}

export default async function RevisoesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Buscar revisões pendentes (sem filtro de data)
    let revisoesPendentes: Array<{
        dataId: string
        autoAvaliacao: string
        questoesAcertadas: number
        questoesTotal: number
    }> = []

    if (user) {
        const { data } = await supabase
            .from('progresso')
            .select('data_id, auto_avaliacao, questoes_acertadas, questoes_total')
            .eq('user_id', user.id)
            .eq('concluido', true)
            .in('auto_avaliacao', ['preciso_revisar', 'nao_entendi'])
            .order('data_id', { ascending: true }) // Mais antigos primeiro

        revisoesPendentes = (data || []).map((item: any) => ({
            dataId: item.data_id,
            autoAvaliacao: item.auto_avaliacao,
            questoesAcertadas: item.questoes_acertadas,
            questoesTotal: item.questoes_total
        }))
    }

    // Criar mapa de conteúdos para lookup rápido
    const conteudosMap = new Map<string, ConteudoDia>()
        ; (conteudosData.conteudos as ConteudoDia[]).forEach(c => {
            conteudosMap.set(c.data, c)
        })

    // Enriquecer revisões com dados do conteúdo
    const revisoesComConteudo = revisoesPendentes
        .map(r => {
            const conteudo = conteudosMap.get(r.dataId)
            if (!conteudo) return null
            return {
                ...r,
                conteudo
            }
        })
        .filter(Boolean) as Array<{
            dataId: string
            autoAvaliacao: string
            questoesAcertadas: number
            questoesTotal: number
            conteudo: ConteudoDia
        }>

    // Ordenar: "Não entendi" primeiro, depois "Preciso revisar", mais antigos no topo
    revisoesComConteudo.sort((a, b) => {
        // Prioridade 1: nao_entendi vem antes de preciso_revisar
        if (a.autoAvaliacao === 'nao_entendi' && b.autoAvaliacao !== 'nao_entendi') return -1
        if (a.autoAvaliacao !== 'nao_entendi' && b.autoAvaliacao === 'nao_entendi') return 1
        // Prioridade 2: mais antigos primeiro (já ordenado pela query, mas garantir)
        return a.dataId.localeCompare(b.dataId)
    })

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Revisões Pendentes
                    </h1>
                    <p className="text-text-secondary">
                        Conteúdos que você marcou para revisar
                    </p>
                </div>

                {/* Lista de Revisões */}
                {revisoesComConteudo.length === 0 ? (
                    <div className="bg-white shadow-sm rounded-xl p-12 text-center border border-border">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-xl font-semibold text-primary mb-2">
                            Nenhuma revisão pendente!
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Você está em dia com seus estudos. Continue assim!
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Voltar ao Dashboard
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary">
                            {revisoesComConteudo.length} {revisoesComConteudo.length === 1 ? 'conteúdo' : 'conteúdos'} para revisar
                        </p>

                        {revisoesComConteudo.map((revisao) => (
                            <Link
                                key={revisao.dataId}
                                href={`/dia/${revisao.dataId}`}
                                className="block bg-white shadow-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {/* Badge de tipo de revisão */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {revisao.autoAvaliacao === 'nao_entendi' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                    <XCircle className="w-3 h-3" />
                                                    Não entendi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Preciso revisar
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${materiaColors[revisao.conteudo.materia] || 'bg-gray-100 text-gray-700'}`}>
                                                {materiaLabels[revisao.conteudo.materia] || revisao.conteudo.materia}
                                            </span>
                                        </div>

                                        {/* Título */}
                                        <h2 className="text-lg font-semibold text-primary group-hover:text-accent-green-button transition-colors">
                                            {revisao.conteudo.assunto}
                                        </h2>

                                        {/* Info */}
                                        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                                            <span>
                                                📅 Estudado em: {revisao.dataId.split('-').reverse().join('/')}
                                            </span>
                                            <span>
                                                ✏️ Acertos: {revisao.questoesAcertadas}/{revisao.questoesTotal}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seta */}
                                    <ChevronRight className="w-6 h-6 text-text-tertiary group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
