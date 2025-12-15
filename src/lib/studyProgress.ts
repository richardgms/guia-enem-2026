import type { ConteudoDia } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

export type StatusEstudante = 'atrasado' | 'em_dia' | 'adiantado'

export interface AnaliseEstudante {
    status: StatusEstudante
    diasAtrasados: number
    diasAdiantados: number
    tarefasAtrasadas: ConteudoDia[]
    proximaRevisao: ConteudoDia | null
}

export interface TarefaRecomendada {
    tarefa: ConteudoDia
    tipo: 'atrasada' | 'hoje' | 'proxima' | 'adiantado'
}

export interface ResultadoPermissao {
    permitido: boolean
    motivo?: string
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Converte uma data YYYY-MM-DD para objeto Date no fuso horário de São Paulo
 * Adiciona T12:00:00 para evitar problemas de timezone
 */
function parseDataConteudo(dataStr: string): Date {
    return new Date(dataStr + 'T12:00:00')
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (fuso horário de São Paulo)
 */
export function getHojeBrasil(): string {
    return new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-')
}

/**
 * Compara duas datas no formato YYYY-MM-DD
 * Retorna: negativo se a < b, 0 se iguais, positivo se a > b
 */
function compararDatas(a: string, b: string): number {
    return a.localeCompare(b)
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Calcula o status do estudante baseado em tarefas concluídas
 */
export function calcularStatusEstudante(
    conteudos: ConteudoDia[],
    progressos: Record<string, { concluido: boolean }>,
    hoje: string
): AnaliseEstudante {
    // Filtra tarefas atrasadas (data < hoje e não concluídas)
    const tarefasAtrasadas = conteudos.filter(c => {
        const isAntiga = compararDatas(c.data, hoje) < 0
        const naoConcluida = !progressos[c.id]?.concluido
        return isAntiga && naoConcluida
    }).sort((a, b) => compararDatas(a.data, b.data)) // Ordena da mais antiga para mais recente

    const diasAtrasados = tarefasAtrasadas.length

    // Calcula dias adiantados (tarefas futuras já concluídas, exceto revisões)
    const tarefasAdiantadas = conteudos.filter(c => {
        const isFutura = compararDatas(c.data, hoje) > 0
        const concluida = progressos[c.id]?.concluido === true
        const naoEhRevisao = c.materia !== 'revisao'
        return isFutura && concluida && naoEhRevisao
    })
    const diasAdiantados = tarefasAdiantadas.length

    // Encontra a próxima revisão
    const proximaRevisao = conteudos.find(c => {
        const isFutura = compararDatas(c.data, hoje) >= 0
        return c.materia === 'revisao' && isFutura
    }) || null

    // Determina o status
    let status: StatusEstudante
    if (diasAtrasados > 0) {
        status = 'atrasado'
    } else if (diasAdiantados > 0) {
        status = 'adiantado'
    } else {
        status = 'em_dia'
    }

    return {
        status,
        diasAtrasados,
        diasAdiantados,
        tarefasAtrasadas,
        proximaRevisao
    }
}

/**
 * Retorna a tarefa mais prioritária para o usuário
 * Prioridade: Tarefas atrasadas (mais antiga primeiro) > Tarefa de hoje
 */
export function getTarefaPrioritaria(
    conteudos: ConteudoDia[],
    progressos: Record<string, { concluido: boolean }>,
    hoje: string
): ConteudoDia | null {
    const analise = calcularStatusEstudante(conteudos, progressos, hoje)

    // Se há tarefas atrasadas, retorna a mais antiga
    if (analise.tarefasAtrasadas.length > 0) {
        return analise.tarefasAtrasadas[0]
    }

    // Senão, retorna a tarefa de hoje
    const tarefaHoje = conteudos.find(c => c.data === hoje)
    if (tarefaHoje) {
        return tarefaHoje
    }

    // Se não há tarefa hoje, retorna a próxima não concluída
    const proximaNaoConcluida = conteudos.find(c => {
        const isFutura = compararDatas(c.data, hoje) > 0
        const naoConcluida = !progressos[c.id]?.concluido
        return isFutura && naoConcluida
    })

    return proximaNaoConcluida || null
}

/**
 * Retorna a próxima tarefa recomendada para "Próximos Passos"
 * Lógica:
 * - Se atrasado: primeira tarefa atrasada
 * - Se em dia (hoje pendente): tarefa de hoje
 * - Se em dia (hoje feita): tarefa de amanhã
 * - Se adiantado: próxima tarefa do calendário
 */
export function getProximaTarefa(
    conteudos: ConteudoDia[],
    progressos: Record<string, { concluido: boolean }>,
    hoje: string
): TarefaRecomendada | null {
    const analise = calcularStatusEstudante(conteudos, progressos, hoje)

    // Atrasado: primeira tarefa atrasada
    if (analise.tarefasAtrasadas.length > 0) {
        return {
            tarefa: analise.tarefasAtrasadas[0],
            tipo: 'atrasada'
        }
    }

    // Tarefa de hoje
    const tarefaHoje = conteudos.find(c => c.data === hoje)
    if (tarefaHoje && !progressos[tarefaHoje.id]?.concluido) {
        return {
            tarefa: tarefaHoje,
            tipo: 'hoje'
        }
    }

    // Próxima tarefa não concluída
    const proximaNaoConcluida = conteudos.find(c => {
        const isFutura = compararDatas(c.data, hoje) > 0
        const naoConcluida = !progressos[c.id]?.concluido
        // Para tarefas futuras, só mostra se não for revisão OU se for o dia da revisão
        const podeAdiantar = c.materia !== 'revisao'
        return isFutura && naoConcluida && podeAdiantar
    })

    if (proximaNaoConcluida) {
        return {
            tarefa: proximaNaoConcluida,
            tipo: analise.status === 'adiantado' ? 'adiantado' : 'proxima'
        }
    }

    return null
}

/**
 * Verifica se uma tarefa pode ser concluída
 * Regra: Tarefas de revisão só podem ser feitas no dia programado
 */
export function podeConcluirTarefa(
    conteudo: ConteudoDia,
    hoje: string
): ResultadoPermissao {
    // Revisões só podem ser feitas no próprio dia
    if (conteudo.materia === 'revisao') {
        const comparacao = compararDatas(conteudo.data, hoje)

        if (comparacao > 0) {
            // Revisão é futura
            return {
                permitido: false,
                motivo: 'A revisão só pode ser feita no dia programado. Aguarde até ' +
                    formatarDataExibicao(conteudo.data) + '.'
            }
        }
    }

    return { permitido: true }
}

/**
 * Formata data para exibição: "15/12 (Domingo)"
 */
export function formatarDataExibicao(dataStr: string): string {
    const data = parseDataConteudo(dataStr)
    const dia = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' })
    return `${dia} (${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)})`
}

/**
 * Retorna os próximos N dias de conteúdo que o usuário pode ver
 * Exclui revisões futuras da lista de "próximos passos"
 */
export function getProximosDias(
    conteudos: ConteudoDia[],
    progressos: Record<string, { concluido: boolean }>,
    hoje: string,
    limite: number = 3
): ConteudoDia[] {
    const hojeIndex = conteudos.findIndex(c => c.data === hoje)

    if (hojeIndex === -1) {
        // Se não encontrar hoje, pega a partir da primeira não concluída
        const primeiroNaoConcluido = conteudos.findIndex(c => !progressos[c.id]?.concluido)
        if (primeiroNaoConcluido === -1) return []
        return conteudos.slice(primeiroNaoConcluido + 1, primeiroNaoConcluido + 1 + limite)
    }

    // Pega os próximos N a partir de hoje
    return conteudos.slice(hojeIndex + 1, hojeIndex + 1 + limite)
}
