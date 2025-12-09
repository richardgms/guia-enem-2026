import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DayCardSkeleton() {
    return (
        <Card className="border-l-4 border-l-muted overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-7 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </Card>
    )
}

export function DayContentSkeleton() {
    return (
        <div className="space-y-8 animate-pulse pb-20">
            <div className="space-y-4">
                <Skeleton className="h-4 w-20" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
