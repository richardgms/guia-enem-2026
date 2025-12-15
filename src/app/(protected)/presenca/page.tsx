import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const dynamic = 'force-dynamic'

// Helper para formatar data
function formatarData(dataStr: string): string {
    const data = new Date(dataStr + 'T12:00:00')
    return data.toLocaleDateString('pt-BR', {
        weekday: 'short',
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
        case 'presenca': return 'bg-green-100 text-green-700 border-green-200'
        case 'falta': return 'bg-red-100 text-red-700 border-red-200'
        case 'atrasado': return 'bg-amber-100 text-amber-700 border-amber-200'
        default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
}

interface PresencaRecord {
    data: string
    data_id: string
    status: 'presenca' | 'falta' | 'atrasado'
}

export default async function PresencaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let presencas: PresencaRecord[] = []
    let stats = { presencas: 0, faltas: 0, atrasados: 0, total: 0 }

    if (user) {
        const { data } = await supabase
            .from('presenca')
            .select('data, data_id, status')
            .eq('user_id', user.id)
            .order('data', { ascending: true })

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
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-slate-50">
                        <h3 className="font-semibold text-primary">Histórico de Presença</h3>
                    </div>

                    {presencas.length === 0 ? (
                        <div className="p-8 text-center text-text-secondary">
                            <p className="text-4xl mb-2">📭</p>
                            <p>Nenhum registro de presença ainda.</p>
                            <p className="text-sm mt-1">Complete tarefas para ver seu histórico aqui!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {presencas.map((p) => (
                                <Link
                                    href={`/dia/${p.data_id}`}
                                    key={p.data}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getStatusIcon(p.status)}</span>
                                        <div>
                                            <p className="font-medium text-primary capitalize">
                                                {formatarData(p.data)}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {p.data_id}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(p.status)}`}>
                                        {getStatusLabel(p.status)}
                                    </span>
                                </Link>
                            ))}
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
