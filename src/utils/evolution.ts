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
  needsSslTrust?: boolean;
}

export interface QrCodeResult {
  success: boolean;
  base64?: string;
  code?: string;
  pairingCode?: string;
  message: string;
  needsSslTrust?: boolean;
}

/**
 * Detecta se a URL aponta para um IP direto (ex: https://143.95.186.93)
 */
export function isDirectIpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1'
    );
  } catch {
    return /^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(url);
  }
}

/**
 * Retorna true se estiver rodando no servidor de desenvolvimento Vite local (localhost)
 */
export function isLocalDev(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function isNetworkOrCertError(err: unknown): boolean {
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return msg.includes('fetch') || msg.includes('network') || msg.includes('failed');
  }
  return false;
}

/**
 * Verifica o status de conexão da instância na Evolution API
 */
export async function checkEvolutionConnection(
  config: NotificationConfig
): Promise<EvolutionResult> {
  const apiUrl = cleanUrl(config.evolutionApiUrl || 'https://143.95.186.93');
  const instanceName = (config.evolutionInstanceName || 'AGENDAINTERATIVA').trim();
  const apiKey = (config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();

  // 1. Se for IP direto em produção (Pages), faz conexão DIRETA pelo navegador
  // pois a Evolution API tem CORS liberado e a Cloudflare Workers proíbe conexões de backend para IP direto (Erro 1003).
  if (isDirectIpUrl(apiUrl) && !isLocalDev()) {
    return await checkConnectionDirect(apiUrl, instanceName, apiKey);
  }

  // 2. Se for local dev, tenta o proxy do Vite primeiro
  if (isLocalDev()) {
    try {
      const proxyRes = await fetch(`/api/evolution-proxy/instance/connectionState/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
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
    } catch {
      // continua
    }
  }

  // 3. Tenta via backend (/api/send-evolution) para domínios com certificado normal
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

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: data.success,
        state: data.state,
        isOpen: data.isOpen,
        message: data.isOpen
          ? 'Instância conectada e pronta no WhatsApp! 🟢'
          : `Instância status: ${data.state || 'desconectada'} 🔴`,
      };
    }

    if (data?.isDirectIp || data?.error?.includes('1003')) {
      return await checkConnectionDirect(apiUrl, instanceName, apiKey);
    }
  } catch (err) {
    console.warn('Endpoint /api/send-evolution inacessível, tentando direto...', err);
  }

  // 4. Fallback final: Conexão direta pelo navegador
  return await checkConnectionDirect(apiUrl, instanceName, apiKey);
}

async function checkConnectionDirect(
  apiUrl: string,
  instanceName: string,
  apiKey: string
): Promise<EvolutionResult> {
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
    if (isNetworkOrCertError(err)) {
      return {
        success: false,
        needsSslTrust: true,
        message: `⚠️ Certificado SSL pendente: Abra ${apiUrl} em uma nova aba e clique em 'Avançado > Continuar' para autorizar a Evolution API no navegador.`,
      };
    }
    const errorMsg = err instanceof Error ? err.message : 'Falha na conexão com a Evolution API';
    return {
      success: false,
      message: `Não foi possível conectar: ${errorMsg}`,
    };
  }
}

/**
 * Busca o QR Code para conectar o WhatsApp na Evolution API
 */
export async function fetchEvolutionQrCode(
  config: NotificationConfig
): Promise<QrCodeResult> {
  const apiUrl = cleanUrl(config.evolutionApiUrl || 'https://143.95.186.93');
  const instanceName = (config.evolutionInstanceName || 'AGENDAINTERATIVA').trim();
  const apiKey = (config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();

  // 1. Se for IP direto em produção (Pages), faz conexão DIRETA pelo navegador
  if (isDirectIpUrl(apiUrl) && !isLocalDev()) {
    return await fetchQrCodeDirect(apiUrl, instanceName, apiKey);
  }

  // 2. Se for local dev, tenta o proxy do Vite
  if (isLocalDev()) {
    try {
      const proxyRes = await fetch(`/api/evolution-proxy/instance/connect/${instanceName}`, {
        headers: { apikey: apiKey },
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return {
          success: Boolean(data.base64 || data.code),
          base64: data.base64,
          code: data.code,
          pairingCode: data.pairingCode,
          message: 'QR Code obtido com sucesso!',
        };
      }
    } catch {
      // continua
    }
  }

  // 3. Tenta via backend /api/send-evolution
  try {
    const res = await fetch('/api/send-evolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getQrCode',
        apiUrl,
        apiKey,
        instanceName,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: data.success,
        base64: data.base64,
        code: data.code,
        pairingCode: data.pairingCode,
        message: data.message || 'QR Code obtido com sucesso!',
      };
    }

    if (data?.isDirectIp || data?.error?.includes('1003')) {
      return await fetchQrCodeDirect(apiUrl, instanceName, apiKey);
    }
  } catch (err) {
    console.warn('Falha via proxy /api/send-evolution ao obter QR code', err);
  }

  // 4. Fallback: Conexão direta
  return await fetchQrCodeDirect(apiUrl, instanceName, apiKey);
}

async function fetchQrCodeDirect(
  apiUrl: string,
  instanceName: string,
  apiKey: string
): Promise<QrCodeResult> {
  try {
    const directUrl = `${apiUrl}/instance/connect/${instanceName}`;
    const directRes = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    });

    if (directRes.ok) {
      const data = await directRes.json();
      return {
        success: Boolean(data.base64 || data.code),
        base64: data.base64,
        code: data.code,
        pairingCode: data.pairingCode,
        message: 'QR Code obtido com sucesso!',
      };
    }
    return {
      success: false,
      message: `Erro ao obter QR Code: HTTP ${directRes.status}`,
    };
  } catch (err) {
    if (isNetworkOrCertError(err)) {
      return {
        success: false,
        needsSslTrust: true,
        message: `⚠️ Certificado SSL pendente: Abra ${apiUrl} em uma nova aba e clique em 'Avançado > Continuar'.`,
      };
    }
    return {
      success: false,
      message: `Falha ao obter QR Code: ${err instanceof Error ? err.message : 'Falha de rede'}`,
    };
  }
}

/**
 * Reinicia a instância do WhatsApp na Evolution API
 */
export async function restartEvolutionInstance(
  config: NotificationConfig
): Promise<{ success: boolean; message: string; needsSslTrust?: boolean }> {
  const apiUrl = cleanUrl(config.evolutionApiUrl || 'https://143.95.186.93');
  const instanceName = (config.evolutionInstanceName || 'AGENDAINTERATIVA').trim();
  const apiKey = (config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();

  // 1. Se for IP direto em produção (Pages), faz conexão DIRETA pelo navegador
  if (isDirectIpUrl(apiUrl) && !isLocalDev()) {
    return await restartInstanceDirect(apiUrl, instanceName, apiKey);
  }

  // 2. Se for local dev, tenta o proxy do Vite
  if (isLocalDev()) {
    try {
      const proxyRes = await fetch(`/api/evolution-proxy/instance/restart/${instanceName}`, {
        method: 'POST',
        headers: { apikey: apiKey },
      });
      if (proxyRes.ok) {
        return {
          success: true,
          message: 'Instância reiniciada com sucesso.',
        };
      }
    } catch {
      // continua
    }
  }

  // 3. Tenta via backend /api/send-evolution
  try {
    const res = await fetch('/api/send-evolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'restart',
        apiUrl,
        apiKey,
        instanceName,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: data.success,
        message: data.message || 'Instância reiniciada com sucesso.',
      };
    }

    if (data?.isDirectIp || data?.error?.includes('1003')) {
      return await restartInstanceDirect(apiUrl, instanceName, apiKey);
    }
  } catch {
    // continua
  }

  return await restartInstanceDirect(apiUrl, instanceName, apiKey);
}

async function restartInstanceDirect(
  apiUrl: string,
  instanceName: string,
  apiKey: string
): Promise<{ success: boolean; message: string; needsSslTrust?: boolean }> {
  try {
    const directUrl = `${apiUrl}/instance/restart/${instanceName}`;
    const directRes = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    });

    if (directRes.ok) {
      return {
        success: true,
        message: 'Instância reiniciada com sucesso.',
      };
    }
    return {
      success: false,
      message: `Erro ao reiniciar instância: HTTP ${directRes.status}`,
    };
  } catch (err) {
    if (isNetworkOrCertError(err)) {
      return {
        success: false,
        needsSslTrust: true,
        message: `⚠️ Certificado SSL pendente: Abra ${apiUrl} em uma nova aba e clique em 'Avançado > Continuar'.`,
      };
    }
    return {
      success: false,
      message: 'Falha ao reiniciar instância na Evolution API.',
    };
  }
}

/**
 * Desconecta a instância do WhatsApp (Logout)
 */
export async function logoutEvolutionInstance(
  config: NotificationConfig
): Promise<{ success: boolean; message: string; needsSslTrust?: boolean }> {
  const apiUrl = cleanUrl(config.evolutionApiUrl || 'https://143.95.186.93');
  const instanceName = (config.evolutionInstanceName || 'AGENDAINTERATIVA').trim();
  const apiKey = (config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();

  // 1. Se for IP direto em produção (Pages), faz conexão DIRETA pelo navegador
  if (isDirectIpUrl(apiUrl) && !isLocalDev()) {
    return await logoutInstanceDirect(apiUrl, instanceName, apiKey);
  }

  // 2. Se for local dev, tenta o proxy do Vite
  if (isLocalDev()) {
    try {
      const proxyRes = await fetch(`/api/evolution-proxy/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: { apikey: apiKey },
      });
      if (proxyRes.ok) {
        return {
          success: true,
          message: 'Desconectado com sucesso.',
        };
      }
    } catch {
      // continua
    }
  }

  // 3. Tenta via backend /api/send-evolution
  try {
    const res = await fetch('/api/send-evolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logout',
        apiUrl,
        apiKey,
        instanceName,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: data.success,
        message: data.message || 'Desconectado com sucesso.',
      };
    }

    if (data?.isDirectIp || data?.error?.includes('1003')) {
      return await logoutInstanceDirect(apiUrl, instanceName, apiKey);
    }
  } catch {
    // continua
  }

  return await logoutInstanceDirect(apiUrl, instanceName, apiKey);
}

async function logoutInstanceDirect(
  apiUrl: string,
  instanceName: string,
  apiKey: string
): Promise<{ success: boolean; message: string; needsSslTrust?: boolean }> {
  try {
    const directUrl = `${apiUrl}/instance/logout/${instanceName}`;
    const directRes = await fetch(directUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
    });

    if (directRes.ok) {
      return {
        success: true,
        message: 'Desconectado com sucesso.',
      };
    }
    return {
      success: false,
      message: `Erro ao desconectar: HTTP ${directRes.status}`,
    };
  } catch (err) {
    if (isNetworkOrCertError(err)) {
      return {
        success: false,
        needsSslTrust: true,
        message: `⚠️ Certificado SSL pendente: Abra ${apiUrl} em uma nova aba e clique em 'Avançado > Continuar'.`,
      };
    }
    return {
      success: false,
      message: 'Falha ao desconectar da Evolution API.',
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
  const apiUrl = cleanUrl(config.evolutionApiUrl || 'https://143.95.186.93');
  const instanceName = (config.evolutionInstanceName || 'AGENDAINTERATIVA').trim();
  const apiKey = (config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();

  if (!cleanNum) {
    return {
      success: false,
      message: 'Informe o número do WhatsApp de destino nas configurações.',
    };
  }

  // 1. Se for IP direto em produção (Pages), faz envio DIRETO pelo navegador
  // pois a Evolution API aceita CORS e a Cloudflare Workers rejeita IP direto (Erro 1003).
  if (isDirectIpUrl(apiUrl) && !isLocalDev()) {
    return await sendDirectBrowserMessage(apiUrl, instanceName, apiKey, cleanNum, text);
  }

  // 2. Se estiver em dev local, tenta proxy local do Vite
  if (isLocalDev()) {
    try {
      const endpoint = `/api/evolution-proxy/message/sendText/${instanceName}`;
      const proxyRes = await fetch(endpoint, {
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

      const proxyData = await proxyRes.json().catch(() => null);
      if (proxyRes.ok) {
        return {
          success: true,
          message: 'Lembrete enviado para o WhatsApp com sucesso!',
        };
      }
    } catch {
      // continua
    }
  }

  // 3. Tenta envio através do backend/proxy (/api/send-evolution) para domínios normais
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

    const data = await response.json().catch(() => null);
    if (response.ok && data?.success) {
      return {
        success: true,
        message: 'Lembrete enviado com sucesso para o WhatsApp!',
      };
    }

    if (data?.isDirectIp || data?.error?.includes('1003')) {
      return await sendDirectBrowserMessage(apiUrl, instanceName, apiKey, cleanNum, text);
    }

    if (data?.error) {
      return {
        success: false,
        message: `Evolution API: ${data.error}`,
      };
    }
  } catch (err) {
    console.warn('Backend /api/send-evolution inacessível, tentando direto...', err);
  }

  // 4. Fallback final: Envio direto pelo navegador
  return await sendDirectBrowserMessage(apiUrl, instanceName, apiKey, cleanNum, text);
}

async function sendDirectBrowserMessage(
  apiUrl: string,
  instanceName: string,
  apiKey: string,
  number: string,
  text: string
): Promise<EvolutionResult> {
  const endpoint = `${apiUrl}/message/sendText/${instanceName}`;
  try {
    const directRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number,
        text,
        delay: 1200,
        linkPreview: true,
      }),
    });

    const directData = await directRes.json().catch(() => null);

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
      `Erro retornado pela Evolution API: HTTP ${directRes.status}`;

    return {
      success: false,
      message: `Evolution API: ${desc}`,
    };
  } catch (err) {
    if (isNetworkOrCertError(err)) {
      return {
        success: false,
        needsSslTrust: true,
        message: `⚠️ Certificado SSL pendente: Abra ${apiUrl} em uma nova aba e clique em 'Avançado > Continuar' para autorizar a Evolution API no navegador.`,
      };
    }
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

  // 2. Enviar via Telegram (Apenas se o usuário tiver selecionado explicitamente)
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
