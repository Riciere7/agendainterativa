export type EventCategory = 'estudos' | 'trabalho' | 'saude' | 'amor' | 'rotina';

export type EventPriority = 'baixa' | 'media' | 'alta';

export type ReminderTiming = '0' | '15' | '30' | '60' | '1440'; // minutes before: at time, 15m, 30m, 1h, 1 day

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  locationOrLink?: string;
  priority: EventPriority;
  reminderTiming: ReminderTiming;
  reminderSent?: boolean;
  completed: boolean;
  createdAt: number;
}

export interface LoveNote {
  id: string;
  text: string;
  author: string;
  createdAt: number;
  color: string;
  pinned?: boolean;
}

export interface TelegramConfig {
  wifeName: string;
  husbandName: string;
  botToken: string; // e.g. 123456789:ABCdef...
  chatId: string; // e.g. 987654321
  topicId?: string; // optional supergroup topic
  autoSendEnabled: boolean;
  soundEnabled: boolean;
  sweetMessageSuffix: boolean;
}

export type ThemeId = 'sakura' | 'lavanda' | 'cappuccino' | 'mint' | 'velvet';

export interface HabitTracker {
  date: string; // YYYY-MM-DD
  waterGlasses: number; // target 8
  mood?: 'radiante' | 'focada' | 'tranquila' | 'cansada' | 'sobrecarregada';
  notes?: string;
}

export interface StudyExam {
  id: string;
  subject: string;
  title: string;
  date: string;
  weightOrGrade?: string;
  completed: boolean;
}
