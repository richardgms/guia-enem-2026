import type { StatusEstudante } from '@/lib/studyProgress'

interface StatusFeedbackProps {
    status: StatusEstudante
    diasAtrasados: number
    diasAdiantados: number
}

export function StatusFeedback({ status, diasAtrasados, diasAdiantados }: StatusFeedbackProps) {
    if (status === 'atrasado') {
        return (
            <div className="flex items-center gap-2 mt-2 text-red-600">
                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                    warning
                </span>
                <p className="text-sm font-medium">
                    Você está atrasado em {diasAtrasados} {diasAtrasados === 1 ? 'dia' : 'dias'}
                </p>
            </div>
        )
    }

    if (status === 'adiantado') {
        return (
            <div className="flex items-center gap-2 mt-2 text-blue-600">
                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                    rocket_launch
                </span>
                <p className="text-sm font-medium">
                    Você está adiantado em {diasAdiantados} {diasAdiantados === 1 ? 'dia' : 'dias'}! 🚀
                </p>
            </div>
        )
    }

    // Em dia
    return (
        <div className="flex items-center gap-2 mt-2 text-green-600">
            <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>
                check_circle
            </span>
            <p className="text-sm font-medium">
                Você está em dia! 🎯
            </p>
        </div>
    )
}
