import { AgendaEvent, HabitTracker, LoveNote, StudyExam, ThemeId, NotificationConfig } from '../types';
import { format } from 'date-fns';

const EVENTS_KEY = 'agenda_events_v1';
const NOTIFICATION_CONFIG_KEY = 'agenda_notification_config_v2';
const LEGACY_TELEGRAM_KEY = 'agenda_telegram_config_v1';
const LEGACY_WHATSAPP_KEY = 'agenda_whatsapp_config_v1';
const THEME_KEY = 'agenda_theme_v1';
const LOVE_NOTES_KEY = 'agenda_love_notes_v1';
const HABITS_KEY = 'agenda_habits_v1';
const EXAMS_KEY = 'agenda_exams_v1';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  channel: 'evolution',
  wifeName: 'Danielli',
  husbandName: 'Seu Amor',

  // Evolution API (WhatsApp)
  evolutionApiUrl: 'https://143.95.186.93',
  evolutionApiKey: '842CB014124C-4D07-8662-8D06B06659A0',
  evolutionInstanceName: 'AGENDAINTERATIVA',
  whatsappNumber: '',

  // Telegram (Desativado por padrão)
  botToken: '',
  chatId: '',

  autoSendEnabled: true,
  soundEnabled: true,
  sweetMessageSuffix: true,
};

export const DEFAULT_TELEGRAM_CONFIG = DEFAULT_NOTIFICATION_CONFIG;

export const INITIAL_LOVE_NOTES: LoveNote[] = [
  {
    id: 'note-1',
    text: 'Bom dia, princesa! Que seu dia seja tão lindo e brilhante quanto você. Arrasa nos estudos hoje, tenho muito orgulho do seu esforço!',
    author: 'Seu Marido ❤️',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    color: '#FFE4E6', // rose-100
    pinned: true,
  },
  {
    id: 'note-2',
    text: 'Lembrete do dia: Você é forte, sábia e nada pode parar os planos de Deus na sua vida. Não esqueça de beber água! Te amo infinito.',
    author: 'Com amor, Seu Maridinho 💍',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    color: '#EDE9FE', // violet-100
    pinned: false,
  },
];

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getSampleEvents(): AgendaEvent[] {
  const today = getTodayDateString();
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  const dayAfter = format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd');

  return [
    {
      id: 'event-1',
      title: 'Revisão dos Conteúdos da Faculdade / Concurso',
      description: 'Revisar anotações do módulo 3 e resolver 20 questões de fixação.',
      category: 'estudos',
      date: today,
      time: '09:00',
      endTime: '11:00',
      locationOrLink: 'Mesa de estudos / Notability',
      priority: 'alta',
      reminderTiming: '15',
      completed: false,
      createdAt: Date.now() - 200000,
    },
    {
      id: 'event-2',
      title: 'Reunião de Alinhamento da Semana',
      description: 'Apresentar relatório e definir prioridades dos projetos.',
      category: 'trabalho',
      date: today,
      time: '14:30',
      endTime: '15:30',
      locationOrLink: 'Google Meet',
      priority: 'alta',
      reminderTiming: '30',
      completed: false,
      createdAt: Date.now() - 150000,
    },
    {
      id: 'event-3',
      title: 'Momento Skincare & Leitura Noturna',
      description: 'Relaxar sem telas, ler 15 páginas do livro favorito e descansar.',
      category: 'saude',
      date: today,
      time: '21:00',
      endTime: '21:45',
      priority: 'baixa',
      reminderTiming: '15',
      completed: false,
      createdAt: Date.now() - 100000,
    },
    {
      id: 'event-4',
      title: 'Entrega do Artigo / Relatório Final',
      description: 'Submeter o PDF revisado no portal.',
      category: 'estudos',
      date: tomorrow,
      time: '10:00',
      priority: 'alta',
      reminderTiming: '60',
      completed: false,
      createdAt: Date.now() - 80000,
    },
    {
      id: 'event-5',
      title: 'Jantar Especial do Casal 🍝🍷',
      description: 'Nosso momento favorito juntos para conversar, rir e namorar.',
      category: 'amor',
      date: dayAfter,
      time: '20:00',
      endTime: '22:30',
      locationOrLink: 'Restaurante Favorito',
      priority: 'alta',
      reminderTiming: '60',
      completed: false,
      createdAt: Date.now() - 50000,
    },
  ];
}

export function getSampleExams(): StudyExam[] {
  const futureDate1 = format(new Date(Date.now() + 86400000 * 5), 'yyyy-MM-dd');
  const futureDate2 = format(new Date(Date.now() + 86400000 * 14), 'yyyy-MM-dd');

  return [
    {
      id: 'exam-1',
      subject: 'Direito / Legislação Aplicada',
      title: 'Simulado Geral & Questões Comentadas',
      date: futureDate1,
      weightOrGrade: 'Meta: 85%+',
      completed: false,
    },
    {
      id: 'exam-2',
      subject: 'Gestão de Projetos / Metodologias',
      title: 'Prova Final do Semestre',
      date: futureDate2,
      weightOrGrade: 'Peso 6.0',
      completed: false,
    },
  ];
}

// LocalStorage helpers
export function loadEvents(): AgendaEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      const sample = getSampleEvents();
      saveEvents(sample);
      return sample;
    }
    return JSON.parse(raw);
  } catch {
    return getSampleEvents();
  }
}

export function saveEvents(events: AgendaEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage', err);
  }
}

export function loadNotificationConfig(): NotificationConfig {
  try {
    // 1. Tenta carregar a versão v2 unificada
    const rawV2 = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      return {
        ...DEFAULT_NOTIFICATION_CONFIG,
        ...parsed,
        evolutionApiUrl: parsed.evolutionApiUrl || DEFAULT_NOTIFICATION_CONFIG.evolutionApiUrl,
        evolutionApiKey: parsed.evolutionApiKey || DEFAULT_NOTIFICATION_CONFIG.evolutionApiKey,
        evolutionInstanceName: parsed.evolutionInstanceName || DEFAULT_NOTIFICATION_CONFIG.evolutionInstanceName,
      };
    }

    // 2. Migração suave de versões anteriores (Telegram ou WhatsApp legado)
    const rawLegacyTg = localStorage.getItem(LEGACY_TELEGRAM_KEY);
    const rawLegacyWp = localStorage.getItem(LEGACY_WHATSAPP_KEY);

    let parsedTg: Partial<NotificationConfig> = {};
    let parsedWp: Partial<NotificationConfig> = {};

    if (rawLegacyTg) {
      try {
        parsedTg = JSON.parse(rawLegacyTg);
      } catch {
        // ignore
      }
    }

    if (rawLegacyWp) {
      try {
        const wp = JSON.parse(rawLegacyWp);
        parsedWp = {
          whatsappNumber: wp.wifePhone || '',
          evolutionApiUrl: wp.evolutionApiUrl || '',
          evolutionApiKey: wp.evolutionApiKey || '',
          evolutionInstanceName: wp.evolutionInstanceName || 'agenda',
        };
      } catch {
        // ignore
      }
    }

    const merged: NotificationConfig = {
      ...DEFAULT_NOTIFICATION_CONFIG,
      ...parsedTg,
      ...parsedWp,
    };

    saveNotificationConfig(merged);
    return merged;
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG;
  }
}

export function saveNotificationConfig(config: NotificationConfig): void {
  try {
    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
    // Mantém espelho para componentes legados que leem a chave antiga
    localStorage.setItem(LEGACY_TELEGRAM_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save notification config', err);
  }
}

// Aliases para retrocompatibilidade
export const loadTelegramConfig = loadNotificationConfig;
export const saveTelegramConfig = saveNotificationConfig;

export function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_KEY) as ThemeId;
    return raw || 'sakura';
  } catch {
    return 'sakura';
  }
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}

export function loadLoveNotes(): LoveNote[] {
  try {
    const raw = localStorage.getItem(LOVE_NOTES_KEY);
    if (!raw) {
      saveLoveNotes(INITIAL_LOVE_NOTES);
      return INITIAL_LOVE_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOVE_NOTES;
  }
}

export function saveLoveNotes(notes: LoveNote[]): void {
  try {
    localStorage.setItem(LOVE_NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save love notes', err);
  }
}

export function loadHabitTracker(date: string): HabitTracker {
  try {
    const raw = localStorage.getItem(`${HABITS_KEY}_${date}`);
    if (raw) return JSON.parse(raw);
    return { date, waterGlasses: 0 };
  } catch {
    return { date, waterGlasses: 0 };
  }
}

export function saveHabitTracker(habit: HabitTracker): void {
  try {
    localStorage.setItem(`${HABITS_KEY}_${habit.date}`, JSON.stringify(habit));
  } catch (err) {
    console.error('Failed to save habit tracker', err);
  }
}

export function loadExams(): StudyExam[] {
  try {
    const raw = localStorage.getItem(EXAMS_KEY);
    if (!raw) {
      const sample = getSampleExams();
      saveExams(sample);
      return sample;
    }
    return JSON.parse(raw);
  } catch {
    return getSampleExams();
  }
}

export function saveExams(exams: StudyExam[]): void {
  try {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error('Failed to save exams', err);
  }
}
