import { DayCardSkeleton } from "@/components/LoadingSkeletons"

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-4 w-64 bg-muted rounded-md" />
            </div>

            {/* Progress Section Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="h-24 bg-muted rounded-xl border" />
                <div className="h-24 bg-muted rounded-xl border" />
                <div className="h-24 bg-muted rounded-xl border" />
                <div className="h-24 bg-muted rounded-xl border" />
            </div>

            {/* Today's Content Skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded-md" />
                <DayCardSkeleton />
            </div>

            {/* Next Days Skeleton */}
            <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded-md" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <DayCardSkeleton />
                    <DayCardSkeleton />
                    <DayCardSkeleton />
                </div>
            </div>
        </div>
    )
}
