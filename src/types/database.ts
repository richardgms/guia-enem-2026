import type { AutoAvaliacao } from './index';

export interface ProgressoDB {
    id: string;
    user_id: string;
    data_id: string;
    concluido: boolean;
    auto_avaliacao: AutoAvaliacao | null;
    questoes_acertadas: number;
    questoes_total: number;
    data_revisao: string | null;
    anotacoes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ConfiguracoesDB {
    id: string;
    user_id: string;
    modo_escuro: boolean;
    notificacoes: boolean;
    meta_diaria: number;
    created_at: string;
    updated_at: string;
}

export interface EstatisticasDB {
    id: string;
    user_id: string;
    dias_concluidos: number;
    streak_atual: number;
    maior_streak: number;
    xp_total: number;
    ultimo_dia_estudo: string | null;
    created_at: string;
    updated_at: string;
}

// Tipos para uso no frontend (convertidos do DB)
export interface ProgressoDia {
    dataId: string;
    concluido: boolean;
    autoAvaliacao?: AutoAvaliacao;
    questoesAcertadas: number;
    questoesTotal: number;
    dataRevisao?: string;
    anotacoes?: string;
}

export interface Estatisticas {
    diasConcluidos: number;
    streakAtual: number;
    maiorStreak: number;
    xpTotal: number;
    ultimoDiaEstudo?: string;
}

export interface Configuracoes {
    modoEscuro: boolean;
    notificacoes: boolean;
    metaDiaria: number;
}
