export interface Reward {
    id: string
    title: string
    category: string
    cost: number
    description?: string
    emoji: string
}

export const REWARDS: Reward[] = [
    // Nível 1: Pequenos Mimos
    { id: 'abraco', title: 'Vale Abraço Apertado', category: 'Nível 1', cost: 0, emoji: '🫂', description: 'Resgate ilimitado!' },
    { id: 'dj', title: 'DJ do Carro/Casa', category: 'Nível 1', cost: 100, emoji: '🎵', description: 'Escolher a música por 1h sem reclamações' },
    { id: 'chocolate', title: 'Chocolate Favorito', category: 'Nível 1', cost: 150, emoji: '🍫', description: 'Um bombom ou barra pequena' },
    { id: 'massagem-pe', title: 'Massagem nos Pés', category: 'Nível 1', cost: 150, emoji: '👣', description: '15 min de relaxamento' },
    { id: 'cafe-cama', title: 'Café da Manhã na Cama', category: 'Nível 1', cost: 200, emoji: '🥐', description: 'No final de semana' },
    { id: 'fini', title: 'Pacote Bala Fini', category: 'Nível 1', cost: 250, emoji: '🍬', description: 'Um pacote da sua Fini favorita' },

    // Nível 2: Mimos Legais
    { id: 'pipoca', title: 'Sessão Pipoca', category: 'Nível 2', cost: 300, emoji: '🍿', description: 'Eu preparo tudo e você escolhe o filme' },
    { id: 'acai', title: 'Vale Açaí', category: 'Nível 2', cost: 350, emoji: '🍧', description: 'Aquele caprichado' },
    { id: 'bk-lanche', title: 'Vale Lanche do BK', category: 'Nível 2', cost: 400, emoji: '🍔', description: 'Um lanche ou combo simples' },
    { id: 'banheiro', title: 'Vale "Lava Banheiro"', category: 'Nível 2', cost: 500, emoji: '🧼', description: 'Eu limpo o banheiro (substitui sua vez)' },
    { id: 'massagem-costas', title: 'Massagem nas Costas', category: 'Nível 2', cost: 600, emoji: '💆‍♀️', description: '30 min caprichada' },

    // Nível 3: Recompensas Especiais
    { id: 'pizza', title: 'Vale Pizza', category: 'Nível 3', cost: 800, emoji: '🍕', description: 'Delivery em casa ou na pizzaria' },
    { id: 'praia', title: 'Vale Praia', category: 'Nível 3', cost: 1000, emoji: '🏖️', description: 'Ir pro seu lugar favorito' },
    { id: 'bk-rei', title: 'Vale Lanche do BK', category: 'Nível 3', cost: 1000, emoji: '👑', description: 'Combo Grande + Sobremesa' },
    { id: 'manicure', title: 'Patrocínio Manicure', category: 'Nível 3', cost: 1200, emoji: '💅', description: 'Eu pago a unha da semana' },

    // Nível 4: Objetivos de Longo Prazo
    { id: 'cinema', title: 'Vale Cinema Premium', category: 'Nível 4', cost: 1400, emoji: '🎬', description: 'Ingresso + Pipoca Grande' },
    { id: 'razao', title: 'Vale "Você tem Razão"', category: 'Nível 4', cost: 2000, emoji: '🃏', description: 'Coringa para vencer uma discussão (uso único!)' },
    { id: 'spa', title: 'Day Spa em Casa', category: 'Nível 4', cost: 2500, emoji: '🧖‍♀️', description: 'Banho, esfoliação e massagem completa feito por mim' },
    { id: 'motel', title: 'Vale Motel', category: 'Nível 4', cost: 3000, emoji: '🏩', description: 'Noite ou período especial' },
    { id: 'comprinhas', title: 'Vale Comprinhas', category: 'Nível 4', cost: 3500, emoji: '🛍️', description: 'R$ 150,00 para gastar em roupa/acessório' },
    { id: 'viagem', title: 'Viagem Bate-volta', category: 'Nível 4', cost: 5000, emoji: '🚗', description: 'Fim de semana em lugar legal próximo' },
]
