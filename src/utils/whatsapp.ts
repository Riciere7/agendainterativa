import { AgendaEvent, WhatsAppConfig } from '../types';
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

export function formatEventWhatsAppMessage(event: AgendaEvent, config: WhatsAppConfig): string {
  const emoji = getCategoryEmoji(event.category);
  const categoryName = getCategoryLabel(event.category);
  
  let dateFormatted = event.date;
  try {
    dateFormatted = format(parseISO(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR });
    // Capitalize first letter of weekday
    dateFormatted = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  } catch {
    // fallback
  }

  const timeStr = event.time ? `⏰ *Horário:* ${event.time}${event.endTime ? ` até ${event.endTime}` : ''}\n` : '';
  const locationStr = event.locationOrLink ? `📍 *Local / Link:* ${event.locationOrLink}\n` : '';
  const descStr = event.description ? `📝 *Detalhes:* ${event.description}\n` : '';
  const wifeGreeting = config.wifeName ? `Oi, ${config.wifeName}! 💕` : 'Oi, meu amor! 💕';
  const husbandSign = config.husbandName ? `Com amor, ${config.husbandName} ❤️` : 'Com todo o meu amor! ❤️';

  const sweetNote = config.sweetMessageSuffix
    ? `\n✨ *Lembrete:* Você é incrível, dedicada e vai arrasar em tudo hoje! Estou torcendo por você.\n${husbandSign}`
    : `\n${husbandSign}`;

  return `🔔 *LEMBRETE DA SUA AGENDA* 🔔\n\n` +
    `${wifeGreeting} Não esqueça do seu compromisso:\n\n` +
    `${emoji} *${event.title.toUpperCase()}*\n` +
    `🏷️ *Categoria:* ${categoryName}\n` +
    `📅 *Data:* ${dateFormatted}\n` +
    timeStr +
    locationStr +
    descStr +
    sweetNote;
}

export function getDirectWhatsAppUrl(phone: string, message: string): string {
  // Clean phone numbers (keep only numbers)
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export interface SendWhatsAppResult {
  success: boolean;
  message: string;
  directUrl?: string;
}

export async function sendWhatsAppNotification(
  event: AgendaEvent,
  config: WhatsAppConfig
): Promise<SendWhatsAppResult> {
  const cleanPhone = config.wifePhone.replace(/\D/g, '');
  if (!cleanPhone) {
    return {
      success: false,
      message: 'Número do WhatsApp da esposa não configurado. Adicione nas configurações!',
    };
  }

  const messageText = formatEventWhatsAppMessage(event, config);

  // If manual/direct link mode
  if (config.provider === 'manual' || !config.autoSendEnabled) {
    const directUrl = getDirectWhatsAppUrl(cleanPhone, messageText);
    return {
      success: true,
      message: 'Link para envio direto gerado!',
      directUrl,
    };
  }

  // Try sending through Cloudflare Pages Function (/api/send-whatsapp)
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        message: messageText,
        provider: config.provider,
        callmebotApiKey: config.callmebotApiKey,
        evolutionApiUrl: config.evolutionApiUrl,
        evolutionApiKey: config.evolutionApiKey,
        evolutionInstanceName: config.evolutionInstanceName,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Alerta enviado para o WhatsApp com sucesso!',
      };
    }
  } catch (err) {
    console.warn('Endpoint /api/send-whatsapp not reachable directly, trying fallback', err);
  }

  // Fallback: If CallMeBot is used directly in client (CallMeBot allows GET requests directly)
  if (config.provider === 'callmebot' && config.callmebotApiKey) {
    try {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}&apikey=${config.callmebotApiKey}`;
      
      // Call with no-cors or standard fetch
      await fetch(callmebotUrl, { mode: 'no-cors' });
      return {
        success: true,
        message: 'Mensagem enviada com sucesso para o WhatsApp!',
      };
    } catch {
      // If CORS blocked or offline, fallback to wa.me URL
      const directUrl = getDirectWhatsAppUrl(cleanPhone, messageText);
      return {
        success: true,
        message: 'Alerta pronto para envio no WhatsApp!',
        directUrl,
      };
    }
  }

  // Final fallback to direct link
  const directUrl = getDirectWhatsAppUrl(cleanPhone, messageText);
  return {
    success: true,
    message: 'Abra o WhatsApp para confirmar o envio.',
    directUrl,
  };
}
