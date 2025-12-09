"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakProps {
    dias: number
    maiorStreak?: number
    className?: string
}

export function Streak({ dias, maiorStreak, className }: StreakProps) {
    return (
        <div className={cn("bg-streak-gradient text-streak-card-text shadow-custom rounded-2xl p-6 text-center border border-white/50", className)}>
            <div className="mx-auto w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-3">
                <Flame className={cn(
                    "h-8 w-8 text-streak-card-text fill-streak-card-text transition-all duration-1000",
                    dias > 0 ? "animate-pulse drop-shadow-sm" : "grayscale opacity-50"
                )} />
            </div>

            <div className="text-center">
                <div className="text-5xl font-bold mt-1 text-streak-card-text">
                    {dias} {dias === 1 ? "dia" : "dias"}
                </div>
                <div className="text-sm font-semibold opacity-80 uppercase tracking-wider mt-1">
                    Sequência Atual
                </div>
            </div>

            {maiorStreak !== undefined && maiorStreak > 0 && (
                <>
                    <hr className="border-t border-black/10 my-3" />
                    <div className="text-sm font-medium opacity-80">
                        Recorde: <strong>{maiorStreak} dias</strong>
                    </div>
                </>
            )}
        </div>
    )
}
