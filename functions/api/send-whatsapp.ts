// Cloudflare Pages Function: /api/send-whatsapp
// Executes natively on Cloudflare Pages Functions without additional backend servers.

interface Env {
  DEFAULT_WHATSAPP_PHONE?: string;
  CALLMEBOT_API_KEY?: string;
  EVOLUTION_API_URL?: string;
  EVOLUTION_API_KEY?: string;
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
      phone?: string;
      message?: string;
      provider?: 'callmebot' | 'evolution' | 'manual';
      callmebotApiKey?: string;
      evolutionApiUrl?: string;
      evolutionApiKey?: string;
      evolutionInstanceName?: string;
    };

    const phone = (body.phone || context.env.DEFAULT_WHATSAPP_PHONE || '').replace(/\D/g, '');
    const message = body.message || '';
    const provider = body.provider || 'callmebot';

    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: 'Número de telefone não informado' }), {
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

    // 1. CallMeBot Provider (100% Free Personal WhatsApp Gateway)
    if (provider === 'callmebot') {
      const apiKey = body.callmebotApiKey || context.env.CALLMEBOT_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Chave API do CallMeBot não informada. Gere gratuitamente no WhatsApp!',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const encodedText = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedText}&apikey=${apiKey}`;

      const cfResponse = await fetch(url, { method: 'GET' });
      const textResult = await cfResponse.text();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lembrete enviado com sucesso para o WhatsApp!',
          providerResult: textResult,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Evolution API / Z-API Provider
    if (provider === 'evolution') {
      const apiUrl = body.evolutionApiUrl || context.env.EVOLUTION_API_URL;
      const apiKey = body.evolutionApiKey || context.env.EVOLUTION_API_KEY;
      const instance = body.evolutionInstanceName || 'agenda';

      if (!apiUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'URL da Evolution API não informada',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const targetEndpoint = `${apiUrl.replace(/\/+$/, '')}/message/sendText/${instance}`;
      const evoResponse = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey || '',
        },
        body: JSON.stringify({
          number: phone,
          text: message,
          delay: 1200,
        }),
      });

      const evoData = await evoResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lembrete disparado via Evolution API!',
          data: evoData,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ success: false, error: 'Provedor não suportado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno';
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
