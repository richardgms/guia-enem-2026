"use client"

import { Play, ExternalLink } from "lucide-react"
import type { VideoRecomendado } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface VideoCardProps {
    video: VideoRecomendado
}

export function VideoCard({ video }: VideoCardProps) {
    // Extrair ID do vídeo do YouTube se possível para thumbnail
    const getYoutubeId = (url?: string) => {
        if (!url) return null
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/)
        return match ? match[1] : null
    }

    const videoId = video.youtubeId || getYoutubeId(video.url)
    const videoUrl = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#')

    const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : null

    return (
        <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border-l-4 border-l-transparent hover:border-l-red-500">
            <div className="relative aspect-video bg-muted group">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full bg-slate-200 dark:bg-slate-800">
                        <Play className="h-12 w-12 text-slate-400 fill-slate-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/80 p-3 rounded-full shadow-lg opacity-90 group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-red-600 fill-red-600 ml-1" />
                    </div>
                </div>
                {video.duracao && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {video.duracao}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">
                <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                    {video.titulo}
                </h4>
                <p className="text-xs text-muted-foreground">{video.canal}</p>

                <div className="mt-auto pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs h-8"
                        onClick={() => window.open(videoUrl, '_blank')}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Assistir no YouTube
                    </Button>
                </div>
            </div>
        </Card>
    )
}
