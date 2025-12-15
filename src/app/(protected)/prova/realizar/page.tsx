'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProva } from '@/hooks/useProva'
import { ProvaTimer, ProvaProgress, QuestaoCard, ResultadoProva } from '@/components/prova'

export default function RealizarProvaPage() {
    const router = useRouter()
    const [mostrarConfirmacaoSaida, setMostrarConfirmacaoSaida] = useState(false)
    const {
        prova,
        questoes,
        questaoAtual,
        indiceQuestao,
        tempoRestante,
        carregando,
        erro,
        provaFinalizada,
        verificarElegibilidadeProva,
        enviarResposta,
        encerrarProva
    } = useProva()

    // Carregar prova existente ao montar
    useEffect(() => {
        verificarElegibilidadeProva()
    }, [verificarElegibilidadeProva])

    // Anti-fraude: Bloquear saída da página
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (prova && prova.status === 'em_andamento') {
                e.preventDefault()
                e.returnValue = 'Você tem uma prova em andamento. Sair finalizará sua prova!'
                return e.returnValue
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [prova])

    // Anti-fraude: Detectar mudança de aba/visibilidade
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && prova && prova.status === 'em_andamento') {
                // Log de tentativa de fraude - pode ser enviado ao servidor
                console.warn('Tentativa de sair da aba durante prova')
                setMostrarConfirmacaoSaida(true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [prova])

    // Anti-fraude: Bloquear atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Bloquear Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.
            if (
                (e.ctrlKey && ['c', 'v', 'a', 'p'].includes(e.key.toLowerCase())) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I')
            ) {
                e.preventDefault()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Anti-fraude: Bloquear clique direito
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        document.addEventListener('contextmenu', handleContextMenu)
        return () => document.removeEventListener('contextmenu', handleContextMenu)
    }, [])

    const handleConfirmarSaida = useCallback(async () => {
        await encerrarProva()
        router.push('/prova')
    }, [encerrarProva, router])

    const handleCancelarSaida = () => {
        setMostrarConfirmacaoSaida(false)
    }

    // Loading
    if (carregando && !prova) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-text-secondary">Carregando prova...</p>
                </div>
            </div>
        )
    }

    // Sem prova
    if (!prova || !questaoAtual) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-text-secondary mb-4">Nenhuma prova em andamento</p>
                    <button
                        onClick={() => router.push('/prova')}
                        className="px-6 py-3 bg-accent-green-button hover:opacity-90 text-white rounded-lg transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        )
    }

    // Prova finalizada - mostrar resultado
    if (provaFinalizada) {
        return (
            <div className="py-4">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-2xl font-bold text-primary text-center mb-8">
                        Prova Finalizada!
                    </h1>
                    <ResultadoProva prova={prova} />
                </div>
            </div>
        )
    }

    return (
        <div
            className="py-4"
            style={{ userSelect: 'none' }} // Anti-fraude global
        >
            {/* Modal de confirmação de saída */}
            {mostrarConfirmacaoSaida && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-card-border p-6 max-w-md w-full shadow-lg">
                        <h2 className="text-xl font-bold text-primary mb-4">
                            ⚠️ Atenção!
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Você saiu da aba. Deseja finalizar a prova agora?
                            Suas respostas até o momento serão salvas.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelarSaida}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-primary rounded-lg transition-colors font-semibold"
                            >
                                Continuar Prova
                            </button>
                            <button
                                onClick={handleConfirmarSaida}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                            >
                                Finalizar Prova
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                {/* Header com Timer e Progresso */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-4 mb-6 z-40">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-primary">Prova Semanal</h1>
                        <ProvaTimer tempoRestante={tempoRestante} />
                    </div>
                    <ProvaProgress
                        questaoAtual={indiceQuestao}
                        totalQuestoes={questoes.length}
                    />
                </div>

                {/* Erro */}
                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600 text-sm">{erro}</p>
                    </div>
                )}

                {/* Questão Atual */}
                <QuestaoCard
                    questao={questaoAtual}
                    onResponder={enviarResposta}
                    carregando={carregando}
                />

                {/* Aviso de não voltar */}
                <p className="text-xs text-text-secondary text-center mt-6">
                    Esta prova está sendo monitorada. Tentativas de fraude podem resultar em anulação.
                </p>
            </div>
        </div>
    )
}
