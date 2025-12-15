import type { Materia } from './index'

// =============================================
// ENUMS E TIPOS BASE
// =============================================

export type StatusProva = 'disponivel' | 'em_andamento' | 'finalizada' | 'expirada' | 'bloqueada'

export type Alternativa = 'A' | 'B' | 'C' | 'D' | 'E'

export type DificuldadeQuestao = 'facil' | 'medio' | 'dificil'

// =============================================
// QUESTÕES
// =============================================

// Questão pública (sem gabarito) - usada durante a prova
export interface QuestaoProvaPublica {
    id: string
    semana: number
    materia: Materia | string
    assunto: string
    enunciado: string
    alternativa_a: string
    alternativa_b: string
    alternativa_c: string
    alternativa_d: string
    alternativa_e: string
    dificuldade: DificuldadeQuestao
    ano_enem?: number
}

// Questão completa (com gabarito) - usada no resultado
export interface QuestaoProvaCompleta extends QuestaoProvaPublica {
    gabarito: Alternativa
    explicacao?: string
}

// =============================================
// RESPOSTAS
// =============================================

export interface RespostaQuestao {
    questao_id: string
    resposta: Alternativa
    correta: boolean
    tempo_segundos: number
}

// Resultado da verificação server-side
export interface ResultadoVerificacao {
    correta: boolean
    gabarito_correto: Alternativa
    explicacao?: string
}

// =============================================
// PROVA SEMANAL
// =============================================

// Registro da prova no banco
export interface ProvaSemanelDB {
    id: string
    user_id: string
    semana: number
    ano: number
    status: StatusProva
    iniciada_em: string | null
    finalizada_em: string | null
    tempo_limite: string | null
    total_questoes: number
    acertos: number
    nota: number
    tempo_gasto_segundos: number
    questao_atual: number
    respostas: RespostaQuestao[]
    session_token: string | null
    ultima_atividade: string | null
    created_at: string
    updated_at: string
}

// Prova formatada para uso no frontend
export interface ProvaSemanal {
    id: string
    semana: number
    ano: number
    status: StatusProva
    iniciadaEm?: Date
    finalizadaEm?: Date
    tempoLimite?: Date
    totalQuestoes: number
    acertos: number
    nota: number
    tempoGastoSegundos: number
    questaoAtual: number
    respostas: RespostaQuestao[]
    sessionToken?: string
}

// =============================================
// MÉTRICAS
// =============================================

export interface DesempenhoMateria {
    acertos: number
    total: number
    percentual: number
}

export interface HistoricoNota {
    semana: number
    nota: number
    data: string
}

export interface MetricasProvasDB {
    id: string
    user_id: string
    total_provas_realizadas: number
    total_questoes_respondidas: number
    total_acertos: number
    media_nota: number
    media_tempo_por_questao: number
    desempenho_por_materia: Record<string, DesempenhoMateria>
    historico_notas: HistoricoNota[]
    maior_nota: number
    maior_sequencia_acertos: number
    updated_at: string
}

export interface MetricasProvas {
    totalProvasRealizadas: number
    totalQuestoesRespondidas: number
    totalAcertos: number
    mediaNota: number
    mediaTempoPorQuestao: number
    desempenhoPorMateria: Record<string, DesempenhoMateria>
    historicoNotas: HistoricoNota[]
    maiorNota: number
    maiorSequenciaAcertos: number
}

// =============================================
// ELEGIBILIDADE
// =============================================

export interface ElegibilidadeProva {
    elegivel: boolean
    diasEstudados: number
    diasNecessarios: number
    semanaAtual: number
    provaJaRealizada: boolean
    provaEmAndamento: boolean
    dentroDoHorario: boolean
    provaAtrasada: boolean
    semanaAtrasada: number | null
    mensagem: string
}

// =============================================
// FOCO DO DIA
// =============================================

export type TipoFocoDoDia =
    | 'prova_atrasada'
    | 'dia_atrasado'
    | 'conteudo_hoje'
    | 'prova_disponivel'
    | 'proximo_dia'
    | 'semana_completa'

export interface FocoDoDia {
    tipo: TipoFocoDoDia
    semana?: number
    data?: string
    diasAtraso?: number
    proximaData?: string
    conteudo?: {
        materia: string
        assunto: string
    }
}

// =============================================
// ESTADO DA PROVA (HOOK)
// =============================================

export interface EstadoProva {
    prova: ProvaSemanal | null
    questoes: QuestaoProvaPublica[]
    questaoAtual: number
    tempoRestante: number
    carregando: boolean
    erro: string | null
}

export interface AcoesProva {
    iniciarProva: () => Promise<void>
    responderQuestao: (resposta: Alternativa) => Promise<ResultadoVerificacao>
    finalizarProva: () => Promise<void>
    validarSessao: () => Promise<boolean>
}
