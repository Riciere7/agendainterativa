import { AgendaEvent, TelegramConfig } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'estudos': return '📚';
    case 'trabalho': return '💼';
    case 'saude': return '💅';
    case 'amor': return '💑';
    case 'rotina': return '🎯';
    default: return '📌';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'estudos': return 'Estudos & Cursos';
    case 'trabalho': return 'Trabalho & Projetos';
    case 'saude': return 'Autocuidado & Saúde';
    case 'amor': return 'Momento a Dois & Lazer';
    case 'rotina': return 'Rotina & Tarefas';
    default: return 'Geral';
  }
}

export function formatEventTelegramHtml(event: AgendaEvent, config: TelegramConfig): string {
  const emoji = getCategoryEmoji(event.category);
  const categoryName = getCategoryLabel(event.category);

  let dateFormatted = event.date;
  try {
    dateFormatted = format(parseISO(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR });
    dateFormatted = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  } catch {
    // fallback
  }

  const timeStr = event.time
    ? `⏰ <b>Horário:</b> ${event.time}${event.endTime ? ` até ${event.endTime}` : ''}\n`
    : '';

  let locationStr = '';
  if (event.locationOrLink) {
    if (event.locationOrLink.startsWith('http://') || event.locationOrLink.startsWith('https://')) {
      locationStr = `📍 <b>Local / Link:</b> <a href="${event.locationOrLink}">Acessar Link do Compromisso</a>\n`;
    } else {
      locationStr = `📍 <b>Local:</b> ${event.locationOrLink}\n`;
    }
  }

  const descStr = event.description ? `📝 <b>Detalhes:</b> <i>${event.description}</i>\n` : '';
  const wifeGreeting = config.wifeName ? `Oi, <b>${config.wifeName}</b>! 💕` : 'Oi, <b>meu amor</b>! 💕';
  const husbandSign = config.husbandName ? `Com amor, <b>${config.husbandName}</b> ❤️` : 'Com todo o meu amor! ❤️';

  const sweetNote = config.sweetMessageSuffix
    ? `\n✨ <i>Lembrete: Você é incrível, dedicada e vai arrasar em tudo hoje! Estou torcendo por você.</i>\n${husbandSign}`
    : `\n${husbandSign}`;

  return `🔔 <b>LEMBRETE DA SUA AGENDA</b> 🔔\n\n` +
    `${wifeGreeting} Não esqueça do seu compromisso:\n\n` +
    `${emoji} <b>${event.title.toUpperCase()}</b>\n` +
    `🏷️ <b>Categoria:</b> ${categoryName}\n` +
    `📅 <b>Data:</b> ${dateFormatted}\n` +
    timeStr +
    locationStr +
    descStr +
    sweetNote;
}

export interface SendTelegramResult {
  success: boolean;
  message: string;
}

export async function sendTelegramNotification(
  event: AgendaEvent,
  config: TelegramConfig
): Promise<SendTelegramResult> {
  if (!config.botToken || !config.chatId) {
    return {
      success: false,
      message: 'Configure o Bot Token e o Chat ID do Telegram nas configurações.',
    };
  }

  const textHtml = formatEventTelegramHtml(event, config);
  return sendRawTelegramMessage(textHtml, config);
}

export async function sendRawTelegramMessage(
  textHtml: string,
  config: TelegramConfig
): Promise<SendTelegramResult> {
  const botToken = config.botToken.trim();
  const chatId = config.chatId.trim();

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Bot Token e Chat ID são obrigatórios.',
    };
  }

  // 1. Try sending via Cloudflare Pages Function (/api/send-telegram)
  try {
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken,
        chatId,
        message: textHtml,
        parseMode: 'HTML',
        topicId: config.topicId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          message: 'Lembrete enviado com sucesso para o Telegram!',
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/send-telegram unreachable, trying direct Telegram API fallback', err);
  }

  // 2. Direct browser fetch to Telegram Bot API (Telegram officially supports CORS!)
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: textHtml,
      parse_mode: 'HTML',
    };

    if (config.topicId) {
      payload.message_thread_id = parseInt(config.topicId, 10);
    }

    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      return {
        success: true,
        message: 'Lembrete enviado para o Telegram com sucesso!',
      };
    } else {
      return {
        success: false,
        message: `Erro do Telegram: ${data.description || 'Não foi possível enviar.'}`,
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha na conexão com o Telegram';
    return {
      success: false,
      message: msg,
    };
  }
}
