"use client"

import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css" // Importante para o CSS do Katex

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ResumoCardProps {
    resumo: string
    assunto: string
}

export function ResumoCard({ resumo, assunto }: ResumoCardProps) {
    return (
        <Card className="w-full h-full shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                    📝 Resumo: {assunto}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full p-6">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-relaxed prose-li:marker:text-primary
            prose-strong:text-primary prose-strong:font-bold
            prose-table:border-collapse prose-th:bg-muted prose-th:p-2 prose-td:p-2 prose-td:border">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {resumo}
                        </ReactMarkdown>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
