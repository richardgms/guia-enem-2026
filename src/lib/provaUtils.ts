// Funções utilitárias para cálculo de semanas do cronograma
// Estas funções são puras e podem ser usadas em Server Components

// Data de início do cronograma (09/12/2025 = Terça-feira)
const INICIO_CRONOGRAMA = new Date('2025-12-09T00:00:00')

// Primeiro domingo do cronograma (14/12/2025)
const PRIMEIRO_DOMINGO = new Date('2025-12-14T23:59:59')

// Calcula a semana do cronograma baseada no domingo
// Se passou o domingo da semana N, estamos na semana N+1
export function calcularSemanaAtual(data?: Date): number {
    const hoje = data || new Date()

    // Se ainda não passou o primeiro domingo, semana 1
    if (hoje <= PRIMEIRO_DOMINGO) {
        return 1
    }

    // Quantos domingos passaram desde o primeiro?
    const diffMs = hoje.getTime() - PRIMEIRO_DOMINGO.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const semanas = Math.floor(diffDias / 7) + 2 // +2 porque já passamos a semana 1

    return semanas
}

// Retorna o domingo de uma semana específica (fim do prazo da prova)
export function getDomingoDaSemana(semana: number): Date {
    // Semana 1 = 14/12, Semana 2 = 21/12, etc
    const domingo = new Date(PRIMEIRO_DOMINGO)
    domingo.setDate(domingo.getDate() + (semana - 1) * 7)
    return domingo
}

// Constante para semanas com prova cadastrada
export const SEMANAS_COM_PROVA = [1, 2, 3, 4] // Atualizar quando adicionar mais provas
