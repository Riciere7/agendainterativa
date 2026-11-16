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

export type NotificationChannel = 'evolution' | 'telegram' | 'both';

export interface NotificationConfig {
  channel: NotificationChannel;
  wifeName: string;
  husbandName: string;

  // Evolution API (WhatsApp)
  evolutionApiUrl: string; // Ex: https://api.meudominio.com.br ou http://localhost:8080
  evolutionApiKey: string; // Chave de API / apikey
  evolutionInstanceName: string; // Nome da instância, ex: agenda
  whatsappNumber: string; // WhatsApp de destino (com DDD), ex: (11) 99999-9999 ou 5511999999999

  // Telegram (Canal alternativo / redundante)
  botToken: string; // Ex: 123456789:ABCdef...
  chatId: string; // Ex: 987654321
  topicId?: string; // opcional

  autoSendEnabled: boolean;
  soundEnabled: boolean;
  sweetMessageSuffix: boolean;
}

// Retrocompatibilidade
export type TelegramConfig = NotificationConfig;

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
