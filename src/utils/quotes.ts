export interface DailyQuote {
  quote: string;
  authorNote: string;
  category: 'estudo' | 'amor' | 'forca';
}

export const DAILY_QUOTES: DailyQuote[] = [
  {
    quote: "Você é incrivelmente inteligente e capaz. Cada esforço de hoje é um passo rumo aos seus maiores sonhos!",
    authorNote: "Lembre-se do quanto você já conquistou. Tenho muito orgulho de você! ❤️",
    category: 'estudo',
  },
  {
    quote: "Respira fundo, toma um café ou água e vai com calma. Você não precisa fazer tudo perfeito, só dar o seu melhor.",
    authorNote: "Estou sempre aqui torcendo por você em cada segundo do seu dia! ✨",
    category: 'forca',
  },
  {
    quote: "Seu brilho e sua dedicação iluminam tudo ao seu redor. Hoje vai ser um dia produtivo e abençoado!",
    authorNote: "Com todo o meu amor, seu maior fã! 🌸",
    category: 'amor',
  },
  {
    quote: "Grandes vitórias são construídas dia a dia, nos pequenos estudos e nas tarefas diárias. Arrasa!",
    authorNote: "Você é a mulher mais dedicada que eu conheço! 📚",
    category: 'estudo',
  },
  {
    quote: "Não se cobre demais hoje. Respeite seu ritmo, faça uma pausa para respirar e cuide de você.",
    authorNote: "Seu bem-estar vem sempre em primeiro lugar. Te amo! ☕",
    category: 'forca',
  },
  {
    quote: "Foco no processo e fé no seu talento. Nenhuma matéria ou desafio de trabalho é maior que a sua determinação!",
    authorNote: "Você vai tirar isso de letra como sempre faz! 💪",
    category: 'estudo',
  },
  {
    quote: "O mundo é tão mais bonito com seu sorriso. Tenha um dia maravilhoso, meu amor!",
    authorNote: "Contando os minutos para te dar um abraço mais tarde! 🌹",
    category: 'amor',
  },
];

export function getDailyQuote(dayOffset = 0): DailyQuote {
  const dayOfYear = Math.floor((Date.now() / (1000 * 60 * 60 * 24)) + dayOffset);
  const index = Math.abs(dayOfYear) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}
