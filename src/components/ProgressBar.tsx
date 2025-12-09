"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
    current: number
    total: number
    label?: string
    showPercentage?: boolean
    className?: string
    colorClass?: string
}

export function ProgressBar({
    current,
    total,
    label,
    showPercentage = true,
    className,
    colorClass = "bg-primary"
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100))

    return (
        <div className={cn("w-full space-y-1", className)}>
            {(label || showPercentage) && (
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    {label && <span>{label}</span>}
                    {showPercentage && <span>{Math.round(percentage)}%</span>}
                </div>
            )}
            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                <div
                    className={cn("h-full transition-all duration-500 ease-in-out rounded-full", colorClass)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
