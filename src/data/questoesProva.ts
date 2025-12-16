// Questões da Prova Semanal - Semana 1
// Baseadas nos conteúdos estudados de 09/12 a 13/12/2025

import type { Alternativa } from '@/types/provas'

export interface QuestaoProvaLocal {
    id: string
    semana: number
    materia: string
    assunto: string
    enunciado: string
    alternativa_a: string
    alternativa_b: string
    alternativa_c: string
    alternativa_d: string
    alternativa_e: string
    gabarito: Alternativa
    explicacao: string
    dificuldade: 'facil' | 'medio' | 'dificil'
}

// =============================================
// SEMANA 1 - 25 QUESTÕES
// =============================================

export const questoesSemana1: QuestaoProvaLocal[] = [
    // ========== MATEMÁTICA (5 questões) ==========
    {
        id: 'mat-s1-q1',
        semana: 1,
        materia: 'matematica',
        assunto: 'Conjuntos Numéricos',
        dificuldade: 'facil',
        enunciado: 'Considere os números: √16, -3, 0,75, √5, π\n\nQuantos desses números pertencem ao conjunto dos Racionais (ℚ)?',
        alternativa_a: '1',
        alternativa_b: '2',
        alternativa_c: '3',
        alternativa_d: '4',
        alternativa_e: '5',
        gabarito: 'C',
        explicacao: '√16 = 4 (racional), -3 (inteiro, logo racional), 0,75 = 3/4 (racional), √5 ≈ 2,236... (irracional), π (irracional). Total: 3 racionais.'
    },
    {
        id: 'mat-s1-q2',
        semana: 1,
        materia: 'matematica',
        assunto: 'Conjuntos Numéricos',
        dificuldade: 'medio',
        enunciado: 'Considerando os conjuntos numéricos e suas relações de inclusão, qual das afirmações está CORRETA?',
        alternativa_a: 'Todo número natural é inteiro, mas nem todo inteiro é natural.',
        alternativa_b: 'Os números irracionais estão contidos no conjunto dos racionais.',
        alternativa_c: 'O conjunto dos inteiros negativos está contido nos naturais.',
        alternativa_d: 'Zero não pertence a nenhum conjunto numérico.',
        alternativa_e: 'Os racionais e irracionais possuem elementos em comum.',
        gabarito: 'A',
        explicacao: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Todo natural (0,1,2...) é inteiro, mas inteiros negativos (-1,-2...) não são naturais. Racionais e irracionais são disjuntos.'
    },
    {
        id: 'mat-s1-q3',
        semana: 1,
        materia: 'matematica',
        assunto: 'Conjuntos Numéricos',
        dificuldade: 'facil',
        enunciado: 'O número 0,333... é uma dízima periódica. Sobre esse número é correto afirmar:',
        alternativa_a: 'É irracional porque tem infinitas casas decimais.',
        alternativa_b: 'É racional porque pode ser escrito como a fração 1/3.',
        alternativa_c: 'Não pertence ao conjunto dos reais.',
        alternativa_d: 'É natural por ser positivo.',
        alternativa_e: 'É inteiro por se aproximar de zero.',
        gabarito: 'B',
        explicacao: 'Dízimas periódicas são SEMPRE racionais, pois podem ser escritas como fração. 0,333... = 1/3. Já dízimas não periódicas (como π) são irracionais.'
    },
    {
        id: 'mat-s1-q4',
        semana: 1,
        materia: 'matematica',
        assunto: 'Conjuntos Numéricos',
        dificuldade: 'facil',
        enunciado: 'A união do conjunto dos números Racionais (ℚ) com o conjunto dos Irracionais (𝕀) resulta em:',
        alternativa_a: 'Conjunto dos Naturais (ℕ)',
        alternativa_b: 'Conjunto dos Inteiros (ℤ)',
        alternativa_c: 'Conjunto dos Racionais (ℚ)',
        alternativa_d: 'Conjunto dos Reais (ℝ)',
        alternativa_e: 'Conjunto Vazio (∅)',
        gabarito: 'D',
        explicacao: 'ℚ ∪ 𝕀 = ℝ. Os Reais são formados pela união dos Racionais com os Irracionais, sendo esses dois conjuntos disjuntos.'
    },
    {
        id: 'mat-s1-q5',
        semana: 1,
        materia: 'matematica',
        assunto: 'Conjuntos Numéricos',
        dificuldade: 'facil',
        enunciado: 'Qual dos números abaixo é IRRACIONAL?',
        alternativa_a: '√49',
        alternativa_b: '2/7',
        alternativa_c: '-8',
        alternativa_d: '√3',
        alternativa_e: '0,5',
        gabarito: 'D',
        explicacao: '√49 = 7 (racional), 2/7 (fração = racional), -8 (inteiro = racional), √3 ≈ 1,732... (raiz não exata = irracional), 0,5 = 1/2 (racional).'
    },

    // ========== PORTUGUÊS (5 questões) ==========
    {
        id: 'port-s1-q1',
        semana: 1,
        materia: 'portugues',
        assunto: 'Classes Gramaticais',
        dificuldade: 'facil',
        enunciado: 'No trecho "A cidade antiga guarda muitos segredos", a palavra "antiga" é um adjetivo que:',
        alternativa_a: 'Substitui o substantivo cidade.',
        alternativa_b: 'Qualifica o substantivo cidade, atribuindo-lhe uma característica.',
        alternativa_c: 'Liga dois termos da oração.',
        alternativa_d: 'Indica a ação praticada pela cidade.',
        alternativa_e: 'Determina o gênero do verbo.',
        gabarito: 'B',
        explicacao: 'Adjetivos qualificam substantivos, atribuindo-lhes características como idade, cor, tamanho, estado, etc. "Antiga" caracteriza a cidade.'
    },
    {
        id: 'port-s1-q2',
        semana: 1,
        materia: 'portugues',
        assunto: 'Classes Gramaticais',
        dificuldade: 'medio',
        enunciado: 'Na frase "Ela encontrou um livro na biblioteca", o artigo "um" indica que:',
        alternativa_a: 'O livro é conhecido do leitor e específico.',
        alternativa_b: 'Trata-se de qualquer livro, não especificado anteriormente.',
        alternativa_c: 'Existe apenas um livro na biblioteca.',
        alternativa_d: 'O livro pertence à pessoa mencionada.',
        alternativa_e: 'O substantivo é abstrato.',
        gabarito: 'B',
        explicacao: 'Artigos indefinidos (um, uma, uns, umas) generalizam o substantivo, indicando algo não específico ou mencionado pela primeira vez.'
    },
    {
        id: 'port-s1-q3',
        semana: 1,
        materia: 'portugues',
        assunto: 'Classes Gramaticais',
        dificuldade: 'facil',
        enunciado: 'Qual das palavras abaixo é um substantivo ABSTRATO?',
        alternativa_a: 'Mesa',
        alternativa_b: 'Cachorro',
        alternativa_c: 'Brasil',
        alternativa_d: 'Saudade',
        alternativa_e: 'Árvore',
        gabarito: 'D',
        explicacao: 'Substantivos abstratos nomeiam sentimentos, qualidades ou ações que dependem de seres para existir (saudade, amor, beleza). Concretos nomeiam seres com existência própria.'
    },
    {
        id: 'port-s1-q4',
        semana: 1,
        materia: 'portugues',
        assunto: 'Classes Gramaticais',
        dificuldade: 'medio',
        enunciado: 'Compare: "Meu velho amigo me visitou" e "Meu amigo velho me visitou". A mudança de posição do adjetivo altera o sentido porque:',
        alternativa_a: 'Não há alteração de sentido, apenas de estilo.',
        alternativa_b: '"Velho amigo" sugere amizade antiga/afetiva, enquanto "amigo velho" sugere idade avançada.',
        alternativa_c: '"Amigo velho" é gramaticalmente incorreto.',
        alternativa_d: '"Velho amigo" indica que o amigo é jovem.',
        alternativa_e: 'A posição do adjetivo nunca altera o sentido.',
        gabarito: 'B',
        explicacao: 'Adjetivos antepostos costumam ter valor subjetivo/afetivo, enquanto pospostos têm valor objetivo. "Velha casa" = querida; "casa velha" = em mau estado.'
    },
    {
        id: 'port-s1-q5',
        semana: 1,
        materia: 'portugues',
        assunto: 'Classes Gramaticais',
        dificuldade: 'facil',
        enunciado: 'Na frase "O rio Amazonas atravessa vários países", as palavras "Amazonas" e "países" são, respectivamente:',
        alternativa_a: 'Substantivo comum e substantivo próprio.',
        alternativa_b: 'Adjetivo e substantivo.',
        alternativa_c: 'Substantivo próprio e substantivo comum.',
        alternativa_d: 'Artigo e substantivo abstrato.',
        alternativa_e: 'Verbo e adjetivo.',
        gabarito: 'C',
        explicacao: '"Amazonas" é substantivo próprio (nome específico, grafado com maiúscula). "Países" é substantivo comum (designa de forma genérica).'
    },

    // ========== BIOLOGIA (5 questões) ==========
    {
        id: 'bio-s1-q1',
        semana: 1,
        materia: 'biologia',
        assunto: 'Introdução à Biologia',
        dificuldade: 'facil',
        enunciado: 'Na hierarquia biológica, qual é a unidade básica considerada a menor estrutura capaz de realizar todas as funções vitais?',
        alternativa_a: 'Átomo',
        alternativa_b: 'Molécula',
        alternativa_c: 'Célula',
        alternativa_d: 'Tecido',
        alternativa_e: 'Órgão',
        gabarito: 'C',
        explicacao: 'A célula é a unidade morfofisiológica básica da vida. Átomos e moléculas não realizam funções vitais sozinhos; tecidos e órgãos são formados por células.'
    },
    {
        id: 'bio-s1-q2',
        semana: 1,
        materia: 'biologia',
        assunto: 'Introdução à Biologia',
        dificuldade: 'medio',
        enunciado: 'Entre as características que definem os seres vivos, NÃO se inclui:',
        alternativa_a: 'Presença de metabolismo',
        alternativa_b: 'Capacidade de reprodução',
        alternativa_c: 'Composição mineral exclusiva',
        alternativa_d: 'Material genético (DNA ou RNA)',
        alternativa_e: 'Capacidade de evolução',
        gabarito: 'C',
        explicacao: 'Seres vivos possuem: célula (exceto vírus), metabolismo, reprodução, hereditariedade (DNA/RNA) e evolução. Não há "composição mineral exclusiva" como característica.'
    },
    {
        id: 'bio-s1-q3',
        semana: 1,
        materia: 'biologia',
        assunto: 'Introdução à Biologia',
        dificuldade: 'medio',
        enunciado: 'Os vírus são classificados como parasitas intracelulares obrigatórios porque:',
        alternativa_a: 'Vivem dentro de minerais e rochas.',
        alternativa_b: 'Não possuem metabolismo próprio e precisam da maquinaria celular para se reproduzir.',
        alternativa_c: 'São organismos multicelulares complexos.',
        alternativa_d: 'Possuem células procariontes.',
        alternativa_e: 'Realizam fotossíntese dentro das células.',
        gabarito: 'B',
        explicacao: 'Vírus são acelulares e não possuem ribossomos ou enzimas para metabolismo próprio. Precisam invadir células e usar seus recursos para replicar seu material genético.'
    },
    {
        id: 'bio-s1-q4',
        semana: 1,
        materia: 'biologia',
        assunto: 'Introdução à Biologia',
        dificuldade: 'medio',
        enunciado: 'O metabolismo é dividido em duas fases: anabolismo (construção) e catabolismo (degradação). Um exemplo de anabolismo é:',
        alternativa_a: 'A digestão de proteínas em aminoácidos.',
        alternativa_b: 'A síntese de proteínas a partir de aminoácidos.',
        alternativa_c: 'A quebra de glicose para liberar energia.',
        alternativa_d: 'A respiração celular.',
        alternativa_e: 'A decomposição de gorduras.',
        gabarito: 'B',
        explicacao: 'Anabolismo = reações de construção/síntese (gastam energia). Catabolismo = reações de degradação/quebra (liberam energia). Síntese de proteínas é anabolismo.'
    },
    {
        id: 'bio-s1-q5',
        semana: 1,
        materia: 'biologia',
        assunto: 'Introdução à Biologia',
        dificuldade: 'facil',
        enunciado: 'Qual alternativa apresenta um postulado CORRETO da Teoria Celular?',
        alternativa_a: 'Células surgem espontaneamente da matéria não viva.',
        alternativa_b: 'Toda célula se origina de outra célula preexistente.',
        alternativa_c: 'Apenas animais são formados por células.',
        alternativa_d: 'Vírus são células primitivas.',
        alternativa_e: 'Células não contêm material genético.',
        gabarito: 'B',
        explicacao: 'A Teoria Celular estabelece que: (1) todos os seres vivos são formados por células, (2) a célula é a unidade básica, (3) toda célula vem de outra célula.'
    },

    // ========== HISTÓRIA (5 questões) ==========
    {
        id: 'hist-s1-q1',
        semana: 1,
        materia: 'historia',
        assunto: 'Pré-História',
        dificuldade: 'facil',
        enunciado: 'O Paleolítico, também conhecido como Idade da Pedra Lascada, é caracterizado por:',
        alternativa_a: 'Surgimento da agricultura e sedentarismo.',
        alternativa_b: 'Uso de metais como cobre e bronze.',
        alternativa_c: 'Vida nômade, caça, coleta e descoberta do fogo.',
        alternativa_d: 'Construção de grandes cidades-estado.',
        alternativa_e: 'Invenção da escrita cuneiforme.',
        gabarito: 'C',
        explicacao: 'No Paleolítico, os humanos eram nômades (caçadores-coletores), usavam ferramentas de pedra lascada, descobriram o fogo e criaram as primeiras pinturas rupestres.'
    },
    {
        id: 'hist-s1-q2',
        semana: 1,
        materia: 'historia',
        assunto: 'Pré-História',
        dificuldade: 'medio',
        enunciado: 'A Revolução Neolítica (ou Agrícola) transformou profundamente a sociedade humana porque permitiu:',
        alternativa_a: 'O retorno ao nomadismo intensivo.',
        alternativa_b: 'A fixação em territórios (sedentarismo) e o surgimento de aldeias.',
        alternativa_c: 'O abandono total do uso de ferramentas.',
        alternativa_d: 'A extinção da humanidade primitiva.',
        alternativa_e: 'A descoberta da eletricidade.',
        gabarito: 'B',
        explicacao: 'Ao dominar agricultura e domesticação, os humanos passaram a se fixar (sedentarismo), formando aldeias, aumentando a população e desenvolvendo divisão do trabalho.'
    },
    {
        id: 'hist-s1-q3',
        semana: 1,
        materia: 'historia',
        assunto: 'Pré-História',
        dificuldade: 'facil',
        enunciado: 'As pinturas rupestres encontradas em cavernas, como as da Serra da Capivara (Brasil) e Lascaux (França), são importantes porque:',
        alternativa_a: 'Eram usadas como moeda de troca.',
        alternativa_b: 'Serviam apenas como decoração sem significado.',
        alternativa_c: 'Registram aspectos da vida, crenças e cultura de povos ágrafos.',
        alternativa_d: 'Foram criadas no século XX por arqueólogos.',
        alternativa_e: 'Comprovam a existência de extraterrestres.',
        gabarito: 'C',
        explicacao: 'Pinturas rupestres são registros históricos visuais de povos sem escrita (ágrafos). Mostram caçadas, rituais, animais e o cotidiano daqueles grupos.'
    },
    {
        id: 'hist-s1-q4',
        semana: 1,
        materia: 'historia',
        assunto: 'Pré-História',
        dificuldade: 'medio',
        enunciado: 'A Idade dos Metais, que sucede o Neolítico, é marcada pela descoberta e uso de metais na seguinte ordem:',
        alternativa_a: 'Ferro → Bronze → Cobre',
        alternativa_b: 'Cobre → Bronze → Ferro',
        alternativa_c: 'Ouro → Prata → Platina',
        alternativa_d: 'Bronze → Cobre → Ferro',
        alternativa_e: 'Ferro → Cobre → Bronze',
        gabarito: 'B',
        explicacao: 'A ordem foi: Cobre (mais maleável) → Bronze (liga de cobre + estanho, mais resistente) → Ferro (mais duro, permitiu melhores armas e ferramentas).'
    },
    {
        id: 'hist-s1-q5',
        semana: 1,
        materia: 'historia',
        assunto: 'Pré-História',
        dificuldade: 'medio',
        enunciado: 'O termo "Pré-história" é criticado por alguns historiadores porque:',
        alternativa_a: 'Não existem evidências de vida humana antes da escrita.',
        alternativa_b: 'Sugere que povos sem escrita não teriam história, o que é preconceituoso.',
        alternativa_c: 'Foi inventado apenas para fins comerciais.',
        alternativa_d: 'Refere-se ao período após a invenção da escrita.',
        alternativa_e: 'É um termo muito recente, criado no século XXI.',
        gabarito: 'B',
        explicacao: 'O termo sugere que só há "história" após a escrita, desvalorizando povos ágrafos. Hoje usa-se também "povos ágrafos" como alternativa mais respeitosa.'
    },

    // ========== REDAÇÃO (5 questões) ==========
    {
        id: 'red-s1-q1',
        semana: 1,
        materia: 'redacao',
        assunto: 'Estrutura da Redação',
        dificuldade: 'facil',
        enunciado: 'A redação do ENEM exige o tipo textual dissertativo-argumentativo. Isso significa que o candidato deve:',
        alternativa_a: 'Narrar uma história fictícia sobre o tema.',
        alternativa_b: 'Descrever um ambiente ou objeto detalhadamente.',
        alternativa_c: 'Defender uma tese com argumentos e propor uma intervenção.',
        alternativa_d: 'Escrever um poema com rimas sobre o problema.',
        alternativa_e: 'Fazer uma carta pessoal para o corretor.',
        gabarito: 'C',
        explicacao: 'Dissertar é expor ideias sobre um tema; argumentar é defender um ponto de vista. A redação ENEM exige tese + argumentos + proposta de intervenção.'
    },
    {
        id: 'red-s1-q2',
        semana: 1,
        materia: 'redacao',
        assunto: 'Estrutura da Redação',
        dificuldade: 'medio',
        enunciado: 'Na introdução de uma redação nota 1000, os elementos esperados são:',
        alternativa_a: 'Apenas a proposta de intervenção completa.',
        alternativa_b: 'Contextualização, apresentação do tema, tese e indicação dos argumentos.',
        alternativa_c: 'Narração de uma história pessoal.',
        alternativa_d: 'Lista de todos os problemas do Brasil.',
        alternativa_e: 'Cópia integral dos textos motivadores.',
        gabarito: 'B',
        explicacao: 'A introdução deve: contextualizar (repertório), mostrar que entendeu o tema, apresentar sua opinião (tese) e antecipar os argumentos.'
    },
    {
        id: 'red-s1-q3',
        semana: 1,
        materia: 'redacao',
        assunto: 'Estrutura da Redação',
        dificuldade: 'medio',
        enunciado: 'Nos parágrafos de desenvolvimento, o candidato deve:',
        alternativa_a: 'Repetir a introdução com outras palavras.',
        alternativa_b: 'Aprofundar cada argumento com repertório sociocultural e analisar consequências.',
        alternativa_c: 'Apresentar a proposta de intervenção.',
        alternativa_d: 'Contar piadas para entreter o corretor.',
        alternativa_e: 'Deixar em branco para economizar tempo.',
        gabarito: 'B',
        explicacao: 'Cada parágrafo de desenvolvimento deve: apresentar um argumento, usar repertório (dados, citações, exemplos) para sustentá-lo e analisar suas consequências.'
    },
    {
        id: 'red-s1-q4',
        semana: 1,
        materia: 'redacao',
        assunto: 'Estrutura da Redação',
        dificuldade: 'medio',
        enunciado: 'Para obter nota máxima na Competência 5, a proposta de intervenção deve conter cinco elementos. São eles:',
        alternativa_a: 'Título, subtítulo, data, assinatura e dedicatória.',
        alternativa_b: 'Agente, ação, modo/meio, efeito/finalidade e detalhamento.',
        alternativa_c: 'Sujeito, verbo, objeto, predicado e adjunto.',
        alternativa_d: 'Introdução, desenvolvimento 1, desenvolvimento 2, conclusão e bibliografia.',
        alternativa_e: 'Nome, idade, cidade, escola e nota.',
        gabarito: 'B',
        explicacao: 'Os 5 elementos são: QUEM vai fazer (agente), O QUE vai fazer (ação), COMO vai fazer (modo/meio), PARA QUÊ (efeito) e DETALHAMENTO de qualquer um deles.'
    },
    {
        id: 'red-s1-q5',
        semana: 1,
        materia: 'redacao',
        assunto: 'Estrutura da Redação',
        dificuldade: 'facil',
        enunciado: 'Qual das alternativas apresenta um exemplo VÁLIDO de contextualização para a introdução?',
        alternativa_a: '"Eu acho que esse problema é muito grave no Brasil."',
        alternativa_b: 'Citar um filme, livro, lei ou fato histórico relacionado ao tema.',
        alternativa_c: 'Copiar o primeiro parágrafo do texto motivador.',
        alternativa_d: 'Escrever "Bom dia, corretor!" no início.',
        alternativa_e: 'Deixar a primeira linha em branco.',
        gabarito: 'B',
        explicacao: 'A contextualização usa repertório sociocultural (lei, filme, livro, dados, fatos históricos) para introduzir o tema, evitando "eu acho" e cópias.'
    }
]

// Função para buscar questões por semana
export function getQuestoesPorSemana(semana: number): QuestaoProvaLocal[] {
    if (semana === 1) {
        return questoesSemana1
    }
    return []
}

// Função para verificar resposta
export function verificarRespostaLocal(questaoId: string, resposta: string): { correta: boolean; gabarito: string; explicacao: string } {
    const questao = questoesSemana1.find(q => q.id === questaoId)
    if (!questao) {
        return { correta: false, gabarito: '', explicacao: 'Questão não encontrada' }
    }
    return {
        correta: questao.gabarito === resposta,
        gabarito: questao.gabarito,
        explicacao: questao.explicacao
    }
}
