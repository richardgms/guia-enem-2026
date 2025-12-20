"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { RegistroPresenca } from "@/lib/studyProgress"
import type { ConteudoDia } from "@/types"

interface ListaPresencaProps {
    historico: RegistroPresenca[]
    conteudoMap: Record<string, ConteudoDia>
}

// Helpers copiados da página original para manter consistência
function formatarData(dataStr: string): string {
    const data = new Date(dataStr + 'T12:00:00')
    return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
    })
}

function getStatusIcon(status: string): string {
    switch (status) {
        case 'presenca': return '✅'
        case 'falta': return '❌'
        case 'atrasado': return '⚠️'
        default: return '⬜'
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'presenca': return 'Presente'
        case 'falta': return 'Falta'
        case 'atrasado': return 'Recuperou'
        default: return 'Pendente'
    }
}

function getStatusStyle(status: string): string {
    switch (status) {
        case 'presenca': return 'bg-green-50 border-green-200'
        case 'falta': return 'bg-red-50 border-red-200'
        case 'atrasado': return 'bg-amber-50 border-amber-200'
        default: return 'bg-slate-50 border-slate-200'
    }
}

function getMateriaStyle(materia: string): string {
    switch (materia) {
        case 'matematica': return 'bg-blue-100 text-blue-700'
        case 'portugues': return 'bg-purple-100 text-purple-700'
        case 'biologia': return 'bg-cyan-100 text-cyan-700'
        case 'historia': return 'bg-red-100 text-red-700'
        case 'redacao': return 'bg-pink-100 text-pink-700'
        case 'fisica': return 'bg-orange-100 text-orange-700'
        case 'quimica': return 'bg-green-100 text-green-700'
        case 'geografia': return 'bg-lime-100 text-lime-700'
        default: return 'bg-slate-100 text-slate-700'
    }
}

function getMateriaLabel(materia: string): string {
    const labels: Record<string, string> = {
        'matematica': 'Matemática',
        'portugues': 'Português',
        'biologia': 'Biologia',
        'historia': 'História',
        'fisica': 'Física',
        'quimica': 'Química',
        'geografia': 'Geografia',
        'redacao': 'Redação'
    }
    return labels[materia] || materia
}

export function ListaPresenca({ historico, conteudoMap }: ListaPresencaProps) {
    const [ordem, setOrdem] = useState<'desc' | 'asc'>('desc')
    const [limite, setLimite] = useState(10)

    const historicoOrdenado = useMemo(() => {
        return [...historico].sort((a, b) => {
            if (ordem === 'desc') {
                return b.data.localeCompare(a.data)
            }
            return a.data.localeCompare(b.data)
        })
    }, [historico, ordem])

    const itensVisiveis = historicoOrdenado.slice(0, limite)
    const temMais = limite < historicoOrdenado.length

    return (
        <div className="space-y-6">
            {/* Filtros e Controle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-semibold text-primary text-lg">Histórico de Presença</h3>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    <span className="text-xs font-medium text-text-secondary px-2">Ordenar por:</span>
                    <select
                        value={ordem}
                        onChange={(e) => setOrdem(e.target.value as 'desc' | 'asc')}
                        className="text-sm border-none focus:ring-0 cursor-pointer bg-transparent py-1 pr-8"
                    >
                        <option value="desc">Mais recentes</option>
                        <option value="asc">Mais antigos</option>
                    </select>
                </div>
            </div>

            {historico.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-text-secondary border shadow-sm">
                    <p className="text-4xl mb-2">📭</p>
                    <p>Nenhum registro de presença ainda.</p>
                    <p className="text-sm mt-1">Complete tarefas para ver seu histórico aqui!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {itensVisiveis.map((p) => {
                            const conteudo = p.tipo === 'aula' ? conteudoMap[p.data_id] : null
                            const linkHref = p.tipo === 'aula' ? `/dia/${p.data_id}` : '/prova'

                            return (
                                <Link
                                    href={linkHref}
                                    key={p.data_id + p.data}
                                    className={`rounded-xl p-4 border-2 hover:shadow-md transition-all ${getStatusStyle(p.status)}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getStatusIcon(p.status)}</span>
                                            <span className="text-xs font-medium text-text-secondary capitalize">
                                                {formatarData(p.data)}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'presenca' ? 'bg-green-500 text-white' :
                                                p.status === 'atrasado' ? 'bg-amber-500 text-white' :
                                                    p.status === 'falta' ? 'bg-red-500 text-white' : 'bg-slate-400 text-white'
                                            }`}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </div>

                                    {p.tipo === 'aula' && conteudo ? (
                                        <div className="mt-2">
                                            <h4 className="font-bold text-primary line-clamp-1">
                                                {conteudo.assunto}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMateriaStyle(conteudo.materia)}`}>
                                                    {getMateriaLabel(conteudo.materia)}
                                                </span>
                                                <span className="text-xs text-text-secondary">
                                                    ⏱ {conteudo.tempoEstimado}
                                                </span>
                                            </div>
                                        </div>
                                    ) : p.tipo === 'prova' ? (
                                        <div className="mt-2">
                                            <h4 className="font-bold text-primary line-clamp-1">
                                                📝 {p.data_id.replace('prova-s', 'Prova Semana ')}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    Avaliação
                                                </span>
                                                <span className="text-xs text-text-secondary">
                                                    ⏱ 50min
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-secondary mt-1">
                                            {p.data_id}
                                        </p>
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {temMais && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setLimite(prev => prev + 10)}
                                className="bg-white text-primary font-bold py-3 px-8 rounded-xl border shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined" style={{ fontFamily: 'Material Symbols Outlined' }}>expand_more</span>
                                Ver mais registros
                            </button>
                        </div>
                    )}

                    {!temMais && historico.length > 0 && (
                        <p className="text-center text-text-secondary text-sm mt-6">
                            Fim dos registros de presença.
                        </p>
                    )}
                </>
            )}
        </div>
    )
}
