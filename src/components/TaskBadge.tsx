interface TaskBadgeProps {
    tipo: 'atrasado' | 'hoje' | 'adiantado' | 'revisao_bloqueada' | null
}

export function TaskBadge({ tipo }: TaskBadgeProps) {
    if (!tipo) return null

    const configs = {
        atrasado: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            label: 'Atrasado',
            icon: 'schedule'
        },
        hoje: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            label: 'Hoje',
            icon: 'today'
        },
        adiantado: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            label: 'Adiantado',
            icon: 'rocket_launch'
        },
        revisao_bloqueada: {
            bg: 'bg-slate-100',
            text: 'text-slate-600',
            label: 'Aguardando',
            icon: 'lock'
        }
    }

    const config = configs[tipo]

    return (
        <span className={`${config.bg} ${config.text} px-2.5 py-1 rounded-full font-semibold text-xs flex items-center gap-1`}>
            <span
                className="material-symbols-outlined text-sm"
                style={{ fontFamily: 'Material Symbols Outlined' }}
            >
                {config.icon}
            </span>
            {config.label}
        </span>
    )
}
