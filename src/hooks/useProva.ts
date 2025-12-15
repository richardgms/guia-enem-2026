'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
    ProvaSemanal,
    QuestaoProvaPublica,
    Alternativa,
    ResultadoVerificacao,
    ElegibilidadeProva
} from '@/types/provas'
import {
    verificarElegibilidade,
    iniciarProva,
    getQuestoesProva,
    responderQuestao,
    finalizarProva,
    getProvaAtual,
    atualizarAtividadeProva
} from '@/lib/provas'

interface UseProvaReturn {
    // Estado
    prova: ProvaSemanal | null
    questoes: QuestaoProvaPublica[]
    questaoAtual: QuestaoProvaPublica | null
    indiceQuestao: number
    tempoRestante: number
    carregando: boolean
    erro: string | null
    elegibilidade: ElegibilidadeProva | null
    provaFinalizada: boolean
    ultimoResultado: ResultadoVerificacao | null

    // Ações
    verificarElegibilidadeProva: () => Promise<void>
    comecarProva: () => Promise<void>
    enviarResposta: (resposta: Alternativa) => Promise<ResultadoVerificacao>
    encerrarProva: () => Promise<void>
}

export function useProva(): UseProvaReturn {
    const [prova, setProva] = useState<ProvaSemanal | null>(null)
    const [questoes, setQuestoes] = useState<QuestaoProvaPublica[]>([])
    const [indiceQuestao, setIndiceQuestao] = useState(0)
    const [tempoRestante, setTempoRestante] = useState(0)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [elegibilidade, setElegibilidade] = useState<ElegibilidadeProva | null>(null)
    const [provaFinalizada, setProvaFinalizada] = useState(false)
    const [ultimoResultado, setUltimoResultado] = useState<ResultadoVerificacao | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const tempoInicioQuestaoRef = useRef<number>(Date.now())

    // Questão atual
    const questaoAtual = questoes[indiceQuestao] || null

    // Timer countdown
    useEffect(() => {
        if (!prova?.tempoLimite || prova.status !== 'em_andamento') return

        const atualizarTempo = () => {
            const agora = new Date()
            const limite = new Date(prova.tempoLimite!)
            const diff = Math.max(0, Math.floor((limite.getTime() - agora.getTime()) / 1000))
            setTempoRestante(diff)

            // Tempo esgotado
            if (diff === 0) {
                encerrarProva()
            }
        }

        atualizarTempo()
        timerRef.current = setInterval(atualizarTempo, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [prova?.tempoLimite, prova?.status])

    // Atualizar atividade periodicamente (anti-fraude)
    useEffect(() => {
        if (!prova?.id || prova.status !== 'em_andamento') return

        const interval = setInterval(() => {
            atualizarAtividadeProva(prova.id)
        }, 30000) // A cada 30 segundos

        return () => clearInterval(interval)
    }, [prova?.id, prova?.status])

    // Verificar elegibilidade
    const verificarElegibilidadeProva = useCallback(async () => {
        setCarregando(true)
        setErro(null)
        try {
            const result = await verificarElegibilidade()
            setElegibilidade(result)

            // Se tem prova em andamento, carrega ela
            if (result.provaEmAndamento) {
                const provaAtual = await getProvaAtual()
                if (provaAtual) {
                    setProva(provaAtual)
                    const questoesProva = await getQuestoesProva(provaAtual.semana)
                    setQuestoes(questoesProva)
                    setIndiceQuestao(provaAtual.questaoAtual)
                    tempoInicioQuestaoRef.current = Date.now()
                }
            }
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Erro ao verificar elegibilidade')
        } finally {
            setCarregando(false)
        }
    }, [])

    // Iniciar prova
    const comecarProva = useCallback(async () => {
        setCarregando(true)
        setErro(null)
        try {
            const novaProva = await iniciarProva()
            setProva(novaProva)

            const questoesProva = await getQuestoesProva(novaProva.semana)
            setQuestoes(questoesProva)
            setIndiceQuestao(0)
            setProvaFinalizada(false)
            tempoInicioQuestaoRef.current = Date.now()
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Erro ao iniciar prova')
        } finally {
            setCarregando(false)
        }
    }, [])

    // Enviar resposta
    const enviarResposta = useCallback(async (resposta: Alternativa): Promise<ResultadoVerificacao> => {
        if (!prova || !questaoAtual) {
            throw new Error('Prova ou questão não encontrada')
        }

        const tempoGasto = Math.floor((Date.now() - tempoInicioQuestaoRef.current) / 1000)

        const resultado = await responderQuestao(
            prova.id,
            questaoAtual.id,
            resposta,
            tempoGasto
        )

        setUltimoResultado(resultado)

        // Avançar para próxima questão
        const proximoIndice = indiceQuestao + 1
        if (proximoIndice >= questoes.length) {
            // Última questão - finalizar
            await encerrarProva()
        } else {
            setIndiceQuestao(proximoIndice)
            tempoInicioQuestaoRef.current = Date.now()
        }

        return resultado
    }, [prova, questaoAtual, indiceQuestao, questoes.length])

    // Encerrar prova
    const encerrarProva = useCallback(async () => {
        if (!prova) return

        setCarregando(true)
        try {
            const provaFinal = await finalizarProva(prova.id)
            setProva(provaFinal)
            setProvaFinalizada(true)
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Erro ao finalizar prova')
        } finally {
            setCarregando(false)
        }
    }, [prova])

    return {
        prova,
        questoes,
        questaoAtual,
        indiceQuestao,
        tempoRestante,
        carregando,
        erro,
        elegibilidade,
        provaFinalizada,
        ultimoResultado,
        verificarElegibilidadeProva,
        comecarProva,
        enviarResposta,
        encerrarProva
    }
}
