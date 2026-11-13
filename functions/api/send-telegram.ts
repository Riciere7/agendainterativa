// Cloudflare Pages Function: /api/send-telegram
// Serverless execution directly on Cloudflare Pages

interface Env {
  DEFAULT_TELEGRAM_BOT_TOKEN?: string;
  DEFAULT_TELEGRAM_CHAT_ID?: string;
}

interface PagesFunctionContext<E = Record<string, any>> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

export const onRequestPost = async (context: PagesFunctionContext<Env>): Promise<Response> => {
  try {
    const body = (await context.request.json()) as {
      botToken?: string;
      chatId?: string;
      message?: string;
      parseMode?: string;
      topicId?: string;
    };

    const botToken = (body.botToken || context.env.DEFAULT_TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = (body.chatId || context.env.DEFAULT_TELEGRAM_CHAT_ID || '').trim();
    const message = (body.message || '').trim();
    const parseMode = body.parseMode || 'HTML';

    if (!botToken) {
      return new Response(JSON.stringify({ success: false, error: 'Telegram Bot Token não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!chatId) {
      return new Response(JSON.stringify({ success: false, error: 'Telegram Chat ID não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!message) {
      return new Response(JSON.stringify({ success: false, error: 'Mensagem vazia' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
    };

    if (body.topicId) {
      payload.message_thread_id = parseInt(body.topicId, 10);
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const tgRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const tgData = (await tgRes.json()) as { ok: boolean; description?: string };

    if (!tgData.ok) {
      let desc = tgData.description || 'Erro ao enviar mensagem pelo Telegram';
      if (desc.toLowerCase().includes('chat not found')) {
        desc = 'Sua esposa precisa apenas abrir o bot e clicar em "Iniciar" (Start) no Telegram: https://t.me/agentamor_bot';
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: desc,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lembrete enviado com sucesso no Telegram!',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno';
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
