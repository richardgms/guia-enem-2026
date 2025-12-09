export type Materia =
    | 'matematica'
    | 'portugues'
    | 'fisica'
    | 'quimica'
    | 'biologia'
    | 'historia'
    | 'geografia'
    | 'redacao'
    | 'revisao';

export type Dificuldade = 'facil' | 'medio' | 'dificil';

export type StatusDia = 'nao_iniciado' | 'em_andamento' | 'concluido' | 'revisar';

export type AutoAvaliacao = 'entendi_bem' | 'preciso_revisar' | 'nao_entendi';

export interface VideoRecomendado {
    titulo: string;
    canal: string;
    url?: string;
    youtubeId?: string;
    duracao?: string;
}

export interface Alternativa {
    letra: 'A' | 'B' | 'C' | 'D' | 'E';
    texto: string;
}

export interface Questao {
    id: string;
    ano: number;
    enunciado: string;
    alternativas: Alternativa[];
    gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
    explicacao?: string;
    assunto: string;
    materia: Materia;
}

export interface ConteudoDia {
    id: string;
    data: string;
    diaSemana: string;
    materia: Materia;
    assunto: string;
    dificuldade: Dificuldade;
    tempoEstimado: string;
    resumo: string;
    videos: VideoRecomendado[];
    questoes: Questao[];
    dicaExtra?: string;
}
