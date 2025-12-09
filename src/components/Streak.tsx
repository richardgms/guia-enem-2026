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
        <div className={cn("flex flex-col items-center bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-100 dark:border-orange-900", className)}>
            <div className="relative">
                <Flame className={cn(
                    "h-12 w-12 text-orange-500 fill-orange-500 transition-all duration-1000",
                    dias > 0 ? "animate-pulse drop-shadow-lg filter" : "grayscale opacity-50"
                )} />
                {dias > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-black">
                        {dias}
                    </div>
                )}
            </div>

            <div className="mt-2 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dias} {dias === 1 ? "dia" : "dias"}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Sequência Atual
                </div>
            </div>

            {maiorStreak !== undefined && maiorStreak > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800 w-full text-center">
                    <div className="text-xs text-muted-foreground">
                        Recorde: <span className="font-bold text-orange-600 dark:text-orange-400">{maiorStreak} dias</span>
                    </div>
                </div>
            )}
        </div>
    )
}
