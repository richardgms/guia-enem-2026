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

export interface RegistroPresenca {
    data: string
    data_id: string
    status: 'presenca' | 'falta' | 'atrasado' | 'pendente'
    tipo: 'aula' | 'prova'
}

export interface StatsPresenca {
    presencas: number
    faltas: number
    atrasados: number
    total: number
    totalPontos: number
    taxa: number
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

/**
 * Calcula o histórico completo de presença baseado no progresso e provas
 */
export function calcularHistoricoPresenca(
    conteudos: ConteudoDia[],
    progressos: Record<string, { concluido: boolean, first_completed_at?: string }>,
    provasRealizadas: { semana: number, finalizada_em?: string }[],
    hoje: string
): RegistroPresenca[] {
    const historico: RegistroPresenca[] = []

    // 1. Processar Aulas
    conteudos.forEach(conteudo => {
        const progresso = progressos[conteudo.data]
        const dataProgramada = conteudo.data
        const jaPassou = compararDatas(dataProgramada, hoje) < 0
        const ehHoje = dataProgramada === hoje

        let status: 'presenca' | 'falta' | 'atrasado' | 'pendente' = 'pendente'

        if (progresso?.concluido) {
            if (progresso.first_completed_at) {
                const dataConclusao = new Date(progresso.first_completed_at).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/').reverse().join('-')

                const comparacao = compararDatas(dataConclusao, dataProgramada)
                status = comparacao <= 0 ? 'presenca' : 'atrasado'
            } else {
                // Fallback se não tiver data de conclusão
                status = 'presenca'
            }
        } else if (jaPassou) {
            status = 'falta'
        } else if (ehHoje) {
            status = 'pendente'
        }

        historico.push({
            data: dataProgramada,
            data_id: conteudo.data,
            status,
            tipo: 'aula'
        })
    })

    // 2. Processar Provas (Domingos)
    // Usamos o domingo da primeira semana (14/12/2025) como base
    const PRIMEIRO_DOMINGO = new Date('2025-12-14T12:00:00')

    // Mapear provas realizadas por semana
    const provasMap = new Map(provasRealizadas.map(p => [p.semana, p]))

    // Consideramos até a semana atual + 1
    const semanaAtual = Math.ceil(historico.length / 6) // Aproximação baseada em aulas

    for (let s = 1; s <= semanaAtual + 1; s++) {
        const dataDomingo = new Date(PRIMEIRO_DOMINGO)
        dataDomingo.setDate(dataDomingo.getDate() + (s - 1) * 7)
        const dataDomStr = dataDomingo.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-')

        const provaRealizada = provasMap.get(s)
        const jaPassou = compararDatas(dataDomStr, hoje) < 0
        const ehHoje = dataDomStr === hoje

        let status: 'presenca' | 'falta' | 'atrasado' | 'pendente' = 'pendente'

        if (provaRealizada) {
            if (provaRealizada.finalizada_em) {
                const dataConclusao = new Date(provaRealizada.finalizada_em).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/').reverse().join('-')

                const comparacao = compararDatas(dataConclusao, dataDomStr)
                status = comparacao <= 0 ? 'presenca' : 'atrasado'
            } else {
                status = 'presenca'
            }
        } else if (jaPassou) {
            status = 'falta'
        }

        // Se o domingo tiver passado ou for hoje/futuro, adicionamos ao histórico
        // Mas apenas se houver aulas cadastradas para essa semana (para não mostrar domingos infinitos)
        const temAulasNessaSemana = historico.some(h => {
            const hData = new Date(h.data + 'T12:00:00')
            const diffDias = Math.abs((hData.getTime() - dataDomingo.getTime()) / (1000 * 60 * 60 * 24))
            return diffDias <= 6
        })

        if (temAulasNessaSemana) {
            historico.push({
                data: dataDomStr,
                data_id: `prova-s${s}`,
                status,
                tipo: 'prova'
            })
        }
    }

    // Ordenar por data decrescente
    return historico.sort((a, b) => compararDatas(b.data, a.data))
}

/**
 * Gera estatísticas resumidas a partir do histórico de presença
 */
export function gerarStatsPresenca(historico: RegistroPresenca[]): StatsPresenca {
    // Filtramos apenas o que já passou ou foi concluído (ignoramos pendentes futuros)
    const registrosRelevantes = historico.filter(h => h.status !== 'pendente')

    const presencas = registrosRelevantes.filter(h => h.status === 'presenca').length
    const atrasados = registrosRelevantes.filter(h => h.status === 'atrasado').length
    const faltas = registrosRelevantes.filter(h => h.status === 'falta').length

    const totalCount = registrosRelevantes.length
    const totalPontos = presencas + (atrasados * 0.5)

    const taxa = totalCount > 0
        ? Math.round((totalPontos / totalCount) * 100)
        : 0

    return {
        presencas,
        faltas,
        atrasados,
        total: totalCount,
        totalPontos,
        taxa
    }
}
