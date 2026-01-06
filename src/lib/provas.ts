import { createClient } from '@/lib/supabase/client'
import { getQuestoesPorSemana, verificarRespostaLocal } from '@/data/questoesProva'
import type {
    ProvaSemanal,
    ProvaSemanelDB,
    QuestaoProvaPublica,
    RespostaQuestao,
    ResultadoVerificacao,
    ElegibilidadeProva,
    MetricasProvas,
    MetricasProvasDB,
    Alternativa,
    DesempenhoMateria,
    HistoricoNota,
    FocoDoDia
} from '@/types/provas'

// =============================================
// HELPERS
// =============================================

// Data de início do cronograma (09/12/2025 = Terça-feira)
const INICIO_CRONOGRAMA = new Date('2025-12-09T00:00:00')

// Primeiro domingo do cronograma (14/12/2025)
const PRIMEIRO_DOMINGO = new Date('2025-12-14T23:59:59')

function gerarSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

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

function converterProvaDB(db: ProvaSemanelDB): ProvaSemanal {
    return {
        id: db.id,
        semana: db.semana,
        ano: db.ano,
        status: db.status,
        iniciadaEm: db.iniciada_em ? new Date(db.iniciada_em) : undefined,
        finalizadaEm: db.finalizada_em ? new Date(db.finalizada_em) : undefined,
        tempoLimite: db.tempo_limite ? new Date(db.tempo_limite) : undefined,
        totalQuestoes: db.total_questoes,
        acertos: db.acertos,
        nota: db.nota,
        tempoGastoSegundos: db.tempo_gasto_segundos,
        questaoAtual: db.questao_atual,
        respostas: db.respostas || [],
        sessionToken: db.session_token || undefined
    }
}

// =============================================
// ELEGIBILIDADE
// =============================================

export async function verificarElegibilidade(): Promise<ElegibilidadeProva> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const resultadoPadrao: ElegibilidadeProva = {
        elegivel: false,
        diasEstudados: 0,
        diasNecessarios: 6,
        semanaAtual: 0,
        provaJaRealizada: false,
        provaEmAndamento: false,
        dentroDoHorario: false,
        provaAtrasada: false,
        semanaAtrasada: null,
        mensagem: ''
    }

    if (!user) {
        return { ...resultadoPadrao, mensagem: 'Usuário não autenticado' }
    }

    const agora = new Date()
    const semanaAtual = calcularSemanaAtual(agora)
    const anoAtual = agora.getFullYear()
    const diaSemana = agora.getDay() // 0 = domingo, 6 = sábado

    // Verificar se está dentro do horário (sábado 00:00 até domingo 23:59)
    const dentroDoHorario = diaSemana === 6 || diaSemana === 0

    // Buscar TODAS as provas do usuário para verificar atrasos
    // Não filtramos por ano porque o cronograma atravessa 2025-2026
    const { data: todasProvas } = await supabase
        .from('provas_semanais')
        .select('semana, ano, status')
        .eq('user_id', user.id)

    const provasRealizadas = new Set(
        todasProvas?.filter(p => p.status === 'finalizada').map(p => p.semana) || []
    )
    const provasEmAndamento = todasProvas?.find(p => p.status === 'em_andamento')

    // Verificar prova em andamento (prioridade máxima)
    if (provasEmAndamento) {
        return {
            ...resultadoPadrao,
            elegivel: true,
            diasEstudados: 4,
            semanaAtual,
            provaEmAndamento: true,
            dentroDoHorario,
            provaAtrasada: provasEmAndamento.semana < semanaAtual,
            semanaAtrasada: provasEmAndamento.semana < semanaAtual ? provasEmAndamento.semana : null,
            mensagem: 'Você tem uma prova em andamento'
        }
    }

    // Verificar provas atrasadas (semanas anteriores sem prova finalizada)
    // IMPORTANTE: Só verificar semanas que TÊM questões cadastradas (por enquanto só semana 1)
    const SEMANAS_COM_PROVA = [1, 2, 3, 4] // Atualizar quando adicionar mais provas

    let semanaAtrasada: number | null = null
    for (const s of SEMANAS_COM_PROVA) {
        if (s >= semanaAtual) continue // Só verificar semanas anteriores

        // Verificar se o domingo dessa semana já passou
        const domingoDaSemana = getDomingoDaSemana(s)
        if (agora > domingoDaSemana && !provasRealizadas.has(s)) {
            semanaAtrasada = s
            break // Pegar a mais antiga
        }
    }

    // Se tem prova atrasada, permitir fazer em qualquer dia
    if (semanaAtrasada !== null) {
        return {
            ...resultadoPadrao,
            elegivel: true,
            diasEstudados: 6, // Assume que estudou (prova atrasada)
            semanaAtual,
            dentroDoHorario: true, // Pode fazer qualquer dia
            provaAtrasada: true,
            semanaAtrasada,
            mensagem: `Você tem a prova da Semana ${semanaAtrasada} pendente`
        }
    }

    // Verificar se já fez a prova da semana atual
    if (provasRealizadas.has(semanaAtual)) {
        return {
            ...resultadoPadrao,
            semanaAtual,
            provaJaRealizada: true,
            dentroDoHorario,
            mensagem: 'Você já realizou a prova desta semana'
        }
    }

    // Não está no horário permitido (sábado/domingo) e não tem atraso
    if (!dentroDoHorario) {
        return {
            ...resultadoPadrao,
            semanaAtual,
            dentroDoHorario: false,
            mensagem: 'A prova está disponível aos domingos'
        }
    }

    // Buscar dias estudados na semana atual
    const inicioSemana = new Date(INICIO_CRONOGRAMA)
    inicioSemana.setDate(inicioSemana.getDate() + (semanaAtual - 1) * 7)

    const { data: progressos } = await supabase
        .from('progresso')
        .select('data_id, first_completed_at')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .gte('first_completed_at', inicioSemana.toISOString())

    const diasUnicos = new Set<string>()
    progressos?.forEach(p => {
        if (p.first_completed_at) {
            diasUnicos.add(new Date(p.first_completed_at).toISOString().split('T')[0])
        }
    })

    const diasEstudados = diasUnicos.size
    const diasNecessarios = 6 // 6 dias de estudo por semana (segunda a sábado)

    if (diasEstudados < diasNecessarios) {
        return {
            ...resultadoPadrao,
            diasEstudados,
            diasNecessarios,
            semanaAtual,
            dentroDoHorario: true,
            mensagem: `Você precisa estudar pelo menos ${diasNecessarios} dias. Você estudou ${diasEstudados}.`
        }
    }

    return {
        ...resultadoPadrao,
        elegivel: true,
        diasEstudados,
        diasNecessarios,
        semanaAtual,
        dentroDoHorario: true,
        mensagem: 'Você está apto a realizar a prova!'
    }
}

// =============================================
// INICIAR PROVA
// =============================================

export async function iniciarProva(): Promise<ProvaSemanal> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    const elegibilidade = await verificarElegibilidade()

    // Se já tem prova em andamento, retorna ela
    if (elegibilidade.provaEmAndamento) {
        const provaAtual = await getProvaAtual()
        if (provaAtual) return provaAtual
    }

    if (!elegibilidade.elegivel) {
        throw new Error(elegibilidade.mensagem)
    }

    const agora = new Date()
    // Usar semana atrasada se houver, senão usar semana atual
    const semanaParaProva = elegibilidade.semanaAtrasada || calcularSemanaAtual(agora)
    const anoAtual = agora.getFullYear()

    // Buscar questões da semana (LOCALMENTE)
    const questoesLocais = getQuestoesPorSemana(semanaParaProva)

    if (questoesLocais.length === 0) {
        throw new Error('Não há questões disponíveis para esta semana')
    }

    // Tempo limite: 50 minutos
    const tempoLimite = new Date(agora.getTime() + 50 * 60 * 1000)
    const sessionToken = gerarSessionToken()

    const { data, error } = await supabase
        .from('provas_semanais')
        .insert({
            user_id: user.id,
            semana: semanaParaProva,
            ano: anoAtual,
            status: 'em_andamento',
            iniciada_em: agora.toISOString(),
            tempo_limite: tempoLimite.toISOString(),
            total_questoes: questoesLocais.length,
            questao_atual: 0,
            respostas: [],
            session_token: sessionToken,
            ultima_atividade: agora.toISOString()
        })
        .select()
        .single()

    if (error) throw error

    return converterProvaDB(data)
}

// =============================================
// BUSCAR QUESTÕES
// =============================================

export async function getQuestoesProva(semana: number): Promise<QuestaoProvaPublica[]> {
    // Buscar questões LOCALMENTE em vez do Supabase
    const questoesLocais = getQuestoesPorSemana(semana)

    // Converter para o formato QuestaoProvaPublica (sem gabarito)
    return questoesLocais.map(q => ({
        id: q.id,
        semana: q.semana,
        materia: q.materia,
        assunto: q.assunto,
        enunciado: q.enunciado,
        alternativa_a: q.alternativa_a,
        alternativa_b: q.alternativa_b,
        alternativa_c: q.alternativa_c,
        alternativa_d: q.alternativa_d,
        alternativa_e: q.alternativa_e,
        dificuldade: q.dificuldade
    }))
}

// =============================================
// RESPONDER QUESTÃO
// =============================================

export async function responderQuestao(
    provaId: string,
    questaoId: string,
    resposta: Alternativa,
    tempoSegundos: number
): Promise<ResultadoVerificacao> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    // Verificar resposta LOCALMENTE
    const resultadoLocal = verificarRespostaLocal(questaoId, resposta)

    const resultado = {
        correta: resultadoLocal.correta,
        gabarito_correto: resultadoLocal.gabarito as Alternativa,
        explicacao: resultadoLocal.explicacao
    }

    // Buscar prova atual
    const { data: prova, error: provaError } = await supabase
        .from('provas_semanais')
        .select('*')
        .eq('id', provaId)
        .eq('user_id', user.id)
        .single()

    if (provaError || !prova) throw new Error('Prova não encontrada')

    // Adicionar resposta ao array
    const novaResposta: RespostaQuestao = {
        questao_id: questaoId,
        resposta,
        correta: resultado.correta,
        tempo_segundos: tempoSegundos
    }

    const respostasAtualizadas = [...(prova.respostas || []), novaResposta]
    const novoAcertos = respostasAtualizadas.filter(r => r.correta).length

    // Atualizar prova
    const { error: updateError } = await supabase
        .from('provas_semanais')
        .update({
            questao_atual: prova.questao_atual + 1,
            respostas: respostasAtualizadas,
            acertos: novoAcertos,
            ultima_atividade: new Date().toISOString()
        })
        .eq('id', provaId)

    if (updateError) throw updateError

    return {
        correta: resultado.correta,
        gabarito_correto: resultado.gabarito_correto,
        explicacao: resultado.explicacao || undefined
    }
}

// =============================================
// FINALIZAR PROVA
// =============================================

export async function finalizarProva(provaId: string): Promise<ProvaSemanal> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuário não autenticado')

    // Buscar prova
    const { data: prova, error: provaError } = await supabase
        .from('provas_semanais')
        .select('*')
        .eq('id', provaId)
        .eq('user_id', user.id)
        .single()

    if (provaError || !prova) throw new Error('Prova não encontrada')

    const agora = new Date()
    const iniciadaEm = new Date(prova.iniciada_em)
    const tempoGasto = Math.floor((agora.getTime() - iniciadaEm.getTime()) / 1000)

    // Calcular nota (escala ENEM: 0-1000)
    const percentualAcerto = prova.total_questoes > 0
        ? prova.acertos / prova.total_questoes
        : 0
    // Nota ENEM simplificada: 200 + (percentual * 800)
    // Mínimo 200, máximo 1000
    const nota = Math.round(200 + (percentualAcerto * 800))

    // Atualizar prova como finalizada
    const { data: provaFinalizada, error: updateError } = await supabase
        .from('provas_semanais')
        .update({
            status: 'finalizada',
            finalizada_em: agora.toISOString(),
            tempo_gasto_segundos: tempoGasto,
            nota
        })
        .eq('id', provaId)
        .select()
        .single()

    if (updateError) throw updateError

    // Atualizar métricas da prova
    await atualizarMetricasProva(user.id, provaFinalizada)

    // Atualizar estatísticas gerais (streak, dias concluídos, etc)
    // Isso inclui os dias recuperados de provas atrasadas
    const { atualizarEstatisticas } = await import('@/lib/database')
    await atualizarEstatisticas()

    return converterProvaDB(provaFinalizada)
}

// =============================================
// ATUALIZAR MÉTRICAS
// =============================================

async function atualizarMetricasProva(userId: string, prova: ProvaSemanelDB) {
    const supabase = createClient()

    // Buscar métricas existentes
    const { data: metricas } = await supabase
        .from('metricas_provas')
        .select('*')
        .eq('user_id', userId)
        .single()

    // Buscar questões para saber matéria de cada resposta
    const questaoIds = prova.respostas.map(r => r.questao_id)
    const { data: questoes } = await supabase
        .from('questoes_prova')
        .select('id, materia')
        .in('id', questaoIds)

    const questoesMap = new Map(questoes?.map(q => [q.id, q.materia]) || [])

    // Calcular desempenho por matéria
    const desempenhoPorMateria: Record<string, DesempenhoMateria> = metricas?.desempenho_por_materia || {}

    prova.respostas.forEach(r => {
        const materia = questoesMap.get(r.questao_id) || 'outro'
        if (!desempenhoPorMateria[materia]) {
            desempenhoPorMateria[materia] = { acertos: 0, total: 0, percentual: 0 }
        }
        desempenhoPorMateria[materia].total++
        if (r.correta) desempenhoPorMateria[materia].acertos++
        desempenhoPorMateria[materia].percentual =
            (desempenhoPorMateria[materia].acertos / desempenhoPorMateria[materia].total) * 100
    })

    // Histórico de notas
    const historicoNotas: HistoricoNota[] = metricas?.historico_notas || []
    historicoNotas.push({
        semana: prova.semana,
        nota: prova.nota,
        data: new Date().toISOString().split('T')[0]
    })

    // Calcular médias
    const totalProvas = (metricas?.total_provas_realizadas || 0) + 1
    const totalQuestoes = (metricas?.total_questoes_respondidas || 0) + prova.total_questoes
    const totalAcertos = (metricas?.total_acertos || 0) + prova.acertos
    const somaTempo = prova.respostas.reduce((acc, r) => acc + r.tempo_segundos, 0)
    const mediaTempo = totalQuestoes > 0
        ? Math.round(((metricas?.media_tempo_por_questao || 0) * (totalQuestoes - prova.total_questoes) + somaTempo) / totalQuestoes)
        : 0

    const somaNotas = historicoNotas.reduce((acc, h) => acc + h.nota, 0)
    const mediaNota = somaNotas / historicoNotas.length

    const maiorNota = Math.max(metricas?.maior_nota || 0, prova.nota)

    await supabase
        .from('metricas_provas')
        .upsert({
            user_id: userId,
            total_provas_realizadas: totalProvas,
            total_questoes_respondidas: totalQuestoes,
            total_acertos: totalAcertos,
            media_nota: mediaNota,
            media_tempo_por_questao: mediaTempo,
            desempenho_por_materia: desempenhoPorMateria,
            historico_notas: historicoNotas,
            maior_nota: maiorNota,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
}

// =============================================
// QUERIES
// =============================================

export async function getProvaAtual(): Promise<ProvaSemanal | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('provas_semanais')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'em_andamento')
        .single()

    if (error || !data) return null

    // Verificar se tempo expirou
    if (data.tempo_limite && new Date(data.tempo_limite) < new Date()) {
        // Finalizar automaticamente
        return await finalizarProva(data.id)
    }

    return converterProvaDB(data)
}

export async function getProvaPorId(provaId: string): Promise<ProvaSemanal | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('provas_semanais')
        .select('*')
        .eq('id', provaId)
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null

    return converterProvaDB(data)
}

export async function getHistoricoProvas(): Promise<ProvaSemanal[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('provas_semanais')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['finalizada', 'expirada'])
        .order('finalizada_em', { ascending: false })

    if (error || !data) return []

    return data.map(converterProvaDB)
}

export async function getMetricasProvas(): Promise<MetricasProvas | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('metricas_provas')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return null

    const db = data as MetricasProvasDB

    return {
        totalProvasRealizadas: db.total_provas_realizadas,
        totalQuestoesRespondidas: db.total_questoes_respondidas,
        totalAcertos: db.total_acertos,
        mediaNota: db.media_nota,
        mediaTempoPorQuestao: db.media_tempo_por_questao,
        desempenhoPorMateria: db.desempenho_por_materia,
        historicoNotas: db.historico_notas,
        maiorNota: db.maior_nota,
        maiorSequenciaAcertos: db.maior_sequencia_acertos
    }
}

// =============================================
// VALIDAÇÃO DE SESSÃO
// =============================================

export async function validarSessaoProva(provaId: string, sessionToken: string): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('provas_semanais')
        .select('session_token, status')
        .eq('id', provaId)
        .eq('user_id', user.id)
        .single()

    if (!data) return false
    if (data.status !== 'em_andamento') return false
    if (data.session_token !== sessionToken) return false

    // Atualizar última atividade
    await supabase
        .from('provas_semanais')
        .update({ ultima_atividade: new Date().toISOString() })
        .eq('id', provaId)

    return true
}

export async function atualizarAtividadeProva(provaId: string): Promise<void> {
    const supabase = createClient()

    await supabase
        .from('provas_semanais')
        .update({ ultima_atividade: new Date().toISOString() })
        .eq('id', provaId)
}
