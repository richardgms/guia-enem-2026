import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import conteudosData from "@/data/conteudos.json"
import type { ConteudoDia } from "@/types"

export const dynamic = 'force-dynamic'

// Helper para formatar data
function formatarData(dataStr: string): string {
    const data = new Date(dataStr + 'T12:00:00')
    return data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
    })
}

// Helper para ícone de status
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

interface PresencaRecord {
    data: string
    data_id: string
    status: 'presenca' | 'falta' | 'atrasado'
}

export default async function PresencaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const conteudos = conteudosData.conteudos as ConteudoDia[]

    let presencas: PresencaRecord[] = []
    let stats = { presencas: 0, faltas: 0, atrasados: 0, total: 0 }

    if (user) {
        const { data } = await supabase
            .from('presenca')
            .select('data, data_id, status')
            .eq('user_id', user.id)
            .order('data', { ascending: false }) // Mais recente primeiro

        if (data) {
            presencas = data as PresencaRecord[]
            stats = {
                presencas: data.filter(p => p.status === 'presenca').length,
                faltas: data.filter(p => p.status === 'falta').length,
                atrasados: data.filter(p => p.status === 'atrasado').length,
                total: data.length
            }
        }
    }

    // Mapa de conteúdo por data_id
    const conteudoMap: Record<string, ConteudoDia> = {}
    conteudos.forEach(c => { conteudoMap[c.data] = c })

    const taxaPresenca = stats.total > 0
        ? Math.round((stats.presencas / stats.total) * 100)
        : 0

    return (
        <div className="p-6 lg:p-8 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">📋 Minha Presença</h1>
                    <p className="text-text-secondary mt-2">
                        Acompanhe sua frequência de estudos diários
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.presencas}</p>
                        <p className="text-sm text-text-secondary mt-1">✅ Presenças</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-amber-600">{stats.atrasados}</p>
                        <p className="text-sm text-text-secondary mt-1">⚠️ Recuperados</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-red-600">{stats.faltas}</p>
                        <p className="text-sm text-text-secondary mt-1">❌ Faltas</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                        <p className="text-3xl font-bold text-primary">{taxaPresenca}%</p>
                        <p className="text-sm text-text-secondary mt-1">📊 Taxa</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl p-5 border shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-primary">Taxa de Presença</h3>
                        <span className="text-sm font-medium text-text-secondary">
                            {stats.presencas} de {stats.total} dias
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${taxaPresenca}%` }}
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                        {taxaPresenca >= 80
                            ? '🎉 Excelente frequência! Continue assim!'
                            : taxaPresenca >= 60
                                ? '👍 Boa frequência, mas pode melhorar!'
                                : '⚠️ Frequência baixa. Tente estudar todos os dias!'}
                    </p>
                </div>

                {/* Attendance List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-primary text-lg">Histórico de Presença</h3>

                    {presencas.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-text-secondary border shadow-sm">
                            <p className="text-4xl mb-2">📭</p>
                            <p>Nenhum registro de presença ainda.</p>
                            <p className="text-sm mt-1">Complete tarefas para ver seu histórico aqui!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {presencas.map((p) => {
                                const conteudo = conteudoMap[p.data_id]

                                return (
                                    <Link
                                        href={`/dia/${p.data_id}`}
                                        key={p.data}
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
                                                    'bg-red-500 text-white'
                                                }`}>
                                                {getStatusLabel(p.status)}
                                            </span>
                                        </div>

                                        {conteudo ? (
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
                                        ) : (() => {
                                            // Verificar se é domingo (dia de prova)
                                            const dataObj = new Date(p.data + 'T12:00:00')
                                            const isDomingo = dataObj.getDay() === 0

                                            if (isDomingo) {
                                                return (
                                                    <div className="mt-2">
                                                        <h4 className="font-bold text-primary line-clamp-1">
                                                            📝 Prova Semanal
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
                                                )
                                            }

                                            return (
                                                <p className="text-sm text-text-secondary mt-1">
                                                    {p.data_id}
                                                </p>
                                            )
                                        })()}
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="bg-slate-50 rounded-xl p-4 border">
                    <h4 className="font-medium text-sm text-primary mb-3">Legenda</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span className="text-text-secondary">Presente - Estudou no dia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span className="text-text-secondary">Recuperou - Fez atrasado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>❌</span>
                            <span className="text-text-secondary">Falta - Não estudou</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

