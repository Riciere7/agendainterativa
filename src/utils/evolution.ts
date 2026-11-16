import { AgendaEvent, LoveNote, NotificationConfig } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCategoryEmoji, getCategoryLabel, sendRawTelegramMessage, formatEventTelegramHtml } from './telegram';

/**
 * Normaliza número de telefone para o padrão exigido pelo WhatsApp e Evolution API (DDI + DDD + Número)
 * Ex: "(11) 98765-4321" -> "5511987654321"
 */
export function normalizeWhatsAppNumber(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Remove 0 inicial se houver (ex: 011987654321)
  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(1);
  }

  // Se tem 10 ou 11 dígitos, é DDD + Número (Brasil sem DDI 55)
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return digits;
}

export function cleanUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Formata mensagem de lembrete no padrão Markdown do WhatsApp (*negrito*, _itálico_)
 */
export function formatEventWhatsAppMessage(event: AgendaEvent, config: NotificationConfig): string {
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
    ? `⏰ *Horário:* ${event.time}${event.endTime ? ` até ${event.endTime}` : ''}\n`
    : '';

  let locationStr = '';
  if (event.locationOrLink) {
    locationStr = `📍 *Local / Link:* ${event.locationOrLink}\n`;
  }

  const descStr = event.description ? `📝 *Detalhes:* _${event.description}_\n` : '';
  const wifeGreeting = config.wifeName ? `Oi, *${config.wifeName}*! 💕` : 'Oi, *meu amor*! 💕';
  const husbandSign = config.husbandName ? `Com amor, *${config.husbandName}* ❤️` : 'Com todo o meu amor! ❤️';

  const sweetNote = config.sweetMessageSuffix
    ? `\n✨ _Lembrete: Você é incrível, dedicada e vai arrasar em tudo hoje! Estou torcendo por você._\n${husbandSign}`
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

/**
 * Formata roteiro diário completo para envio no WhatsApp
 */
export function formatDailySummaryWhatsAppMessage(
  dateTitle: string,
  events: AgendaEvent[],
  config: NotificationConfig
): string {
  let summary = `🌟 *ROTEIRO DO DIA - ${dateTitle.toUpperCase()}* 🌟\n\n`;
  summary += `Oi *${config.wifeName || 'meu amor'}*! Aqui está a sua programação de hoje:\n\n`;

  events.forEach((ev, i) => {
    const time = ev.time ? `[${ev.time}] ` : '';
    const check = ev.completed ? '✅' : '⏳';
    summary += `${i + 1}. ${check} ${time}*${ev.title}*\n`;
    if (ev.locationOrLink) summary += `   📍 _${ev.locationOrLink}_\n`;
  });

  const husbandSign = config.husbandName ? `Com amor, *${config.husbandName}* ❤️` : 'Te amo! ❤️';
  summary += `\n💪 _Você é capaz de tudo! Qualquer coisa estou por aqui torcendo por você._\n${husbandSign}`;
  return summary;
}

/**
 * Formata bilhetinho de amor para o WhatsApp
 */
export function formatLoveNoteWhatsAppMessage(note: LoveNote, _config: NotificationConfig): string {
  return `💌 *BILHETINHO DE AMOR PRA VOCÊ* 💌\n\n` +
    `_"${note.text}"_\n\n` +
    `— *${note.author}* ❤️`;
}

export interface EvolutionResult {
  success: boolean;
  message: string;
  state?: string;
  isOpen?: boolean;
}

/**
 * Verifica o status de conexão da instância na Evolution API
 */
export async function checkEvolutionConnection(
  config: NotificationConfig
): Promise<EvolutionResult> {
  const apiUrl = cleanUrl(config.evolutionApiUrl || '');
  const instanceName = (config.evolutionInstanceName || 'agenda').trim();
  const apiKey = (config.evolutionApiKey || '').trim();

  if (!apiUrl) {
    return { success: false, message: 'URL da Evolution API não informada.' };
  }

  // 1. Tentar via Cloudflare Pages Function proxy (/api/send-evolution)
  try {
    const res = await fetch('/api/send-evolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkConnection',
        apiUrl,
        apiKey,
        instanceName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success,
        state: data.state,
        isOpen: data.isOpen,
        message: data.isOpen
          ? 'Instância conectada e pronta no WhatsApp! 🟢'
          : `Instância status: ${data.state || 'desconectada'} 🔴`,
      };
    }
  } catch (err) {
    console.warn('Proxy /api/send-evolution não respondeu, tentando conexão direta...', err);
  }

  // 2. Fallback: Conexão direta com a Evolution API
  try {
    const directUrl = `${apiUrl}/instance/connectionState/${instanceName}`;
    const directRes = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    });

    if (directRes.ok) {
      const data = await directRes.json();
      const state = data?.instance?.state || data?.state || 'desconhecido';
      const isOpen = state.toLowerCase() === 'open';
      return {
        success: true,
        state,
        isOpen,
        message: isOpen
          ? 'Instância conectada e pronta no WhatsApp! 🟢'
          : `Instância status: ${state} 🔴`,
      };
    }

    return {
      success: false,
      message: `Erro na Evolution API: HTTP ${directRes.status}`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Falha na conexão com a Evolution API';
    return {
      success: false,
      message: `Não foi possível conectar: ${errorMsg}`,
    };
  }
}

/**
 * Envia uma mensagem de texto pelo WhatsApp usando a Evolution API
 */
export async function sendEvolutionTextMessage(
  phone: string,
  text: string,
  config: NotificationConfig
): Promise<EvolutionResult> {
  const cleanNum = normalizeWhatsAppNumber(phone);
  const apiUrl = cleanUrl(config.evolutionApiUrl || '');
  const instanceName = (config.evolutionInstanceName || 'agenda').trim();
  const apiKey = (config.evolutionApiKey || '').trim();

  if (!cleanNum) {
    return {
      success: false,
      message: 'Informe o número do WhatsApp de destino nas configurações.',
    };
  }

  if (!apiUrl) {
    return {
      success: false,
      message: 'Configure a URL da Evolution API nas configurações.',
    };
  }

  // 1. Tenta envio através da Cloudflare Pages Function (/api/send-evolution)
  try {
    const response = await fetch('/api/send-evolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendText',
        apiUrl,
        apiKey,
        instanceName,
        number: cleanNum,
        text,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return {
        success: true,
        message: 'Lembrete enviado com sucesso para o WhatsApp!',
      };
    } else if (data.error) {
      return {
        success: false,
        message: `Evolution API: ${data.error}`,
      };
    }
  } catch (err) {
    console.warn('Backend /api/send-evolution inacessível, tentando fetch direto...', err);
  }

  // 2. Fallback: Envio direto para a Evolution API pelo navegador
  try {
    const endpoint = `${apiUrl}/message/sendText/${instanceName}`;
    const directRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanNum,
        text,
        delay: 1200,
        linkPreview: true,
      }),
    });

    const directData = await directRes.json();
    if (directRes.ok) {
      return {
        success: true,
        message: 'Lembrete enviado para o WhatsApp com sucesso!',
      };
    }

    const desc =
      directData?.response?.message ||
      directData?.message ||
      directData?.error ||
      `Erro HTTP ${directRes.status}`;

    return {
      success: false,
      message: `Evolution API: ${desc}`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Falha na conexão com a Evolution API';
    return {
      success: false,
      message: `Erro ao enviar no WhatsApp: ${errorMsg}`,
    };
  }
}

/**
 * Disparador unificado de notificações para eventos da agenda
 * Envia para Evolution API (WhatsApp), Telegram ou Ambos, conforme configurado
 */
export async function sendNotification(
  event: AgendaEvent,
  config: NotificationConfig
): Promise<EvolutionResult> {
  const channel = config.channel || 'evolution';
  const results: string[] = [];
  let anySuccess = false;

  // 1. Enviar via Evolution API (WhatsApp)
  if (channel === 'evolution' || channel === 'both') {
    const whatsAppText = formatEventWhatsAppMessage(event, config);
    const evoRes = await sendEvolutionTextMessage(config.whatsappNumber, whatsAppText, config);
    if (evoRes.success) {
      anySuccess = true;
      results.push('WhatsApp ✅');
    } else {
      results.push(`WhatsApp falhou: ${evoRes.message}`);
    }
  }

  // 2. Enviar via Telegram
  if (channel === 'telegram' || channel === 'both') {
    const telegramHtml = formatEventTelegramHtml(event, config);
    const tgRes = await sendRawTelegramMessage(telegramHtml, config);
    if (tgRes.success) {
      anySuccess = true;
      results.push('Telegram ✅');
    } else {
      results.push(`Telegram falhou: ${tgRes.message}`);
    }
  }

  if (anySuccess) {
    return {
      success: true,
      message: `Enviado com sucesso! (${results.join(' | ')})`,
    };
  }

  return {
    success: false,
    message: results.length ? results.join(' | ') : 'Nenhum canal de notificação configurado.',
  };
}

/**
 * Disparador unificado de mensagens livres (ex: bilhetinhos de amor, roteiro diário)
 */
export async function sendRawNotification(
  textWhatsApp: string,
  textTelegramHtml: string,
  config: NotificationConfig
): Promise<EvolutionResult> {
  const channel = config.channel || 'evolution';
  const results: string[] = [];
  let anySuccess = false;

  if (channel === 'evolution' || channel === 'both') {
    const evoRes = await sendEvolutionTextMessage(config.whatsappNumber, textWhatsApp, config);
    if (evoRes.success) {
      anySuccess = true;
      results.push('WhatsApp ✅');
    } else {
      results.push(`WhatsApp: ${evoRes.message}`);
    }
  }

  if (channel === 'telegram' || channel === 'both') {
    const tgRes = await sendRawTelegramMessage(textTelegramHtml, config);
    if (tgRes.success) {
      anySuccess = true;
      results.push('Telegram ✅');
    } else {
      results.push(`Telegram: ${tgRes.message}`);
    }
  }

  if (anySuccess) {
    return {
      success: true,
      message: `Enviado com sucesso! (${results.join(' | ')})`,
    };
  }

  return {
    success: false,
    message: results.length ? results.join(' | ') : 'Nenhum canal configurado.',
  };
}
