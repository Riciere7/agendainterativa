// Cloudflare Pages Function: /api/send-evolution
// Proxies Evolution API requests securely from Cloudflare Pages without CORS issues

interface Env {
  EVOLUTION_API_URL?: string;
  EVOLUTION_API_KEY?: string;
  EVOLUTION_INSTANCE_NAME?: string;
  DEFAULT_WHATSAPP_PHONE?: string;
}

interface PagesFunctionContext<E = Record<string, any>> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

function cleanPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  // Se for número brasileiro com 10 ou 11 dígitos sem DDI 55
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return digits;
}

function cleanUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export const onRequestPost = async (context: PagesFunctionContext<Env>): Promise<Response> => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey',
  };

  try {
    const body = (await context.request.json()) as {
      action?: 'sendText' | 'checkConnection';
      apiUrl?: string;
      apiKey?: string;
      instanceName?: string;
      number?: string;
      text?: string;
      delay?: number;
    };

    const action = body.action || 'sendText';
    const rawApiUrl = body.apiUrl || context.env.EVOLUTION_API_URL || '';
    const apiKey = (body.apiKey || context.env.EVOLUTION_API_KEY || '').trim();
    const instanceName = (body.instanceName || context.env.EVOLUTION_INSTANCE_NAME || 'agenda').trim();

    if (!rawApiUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL da Evolution API não informada' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const apiUrl = cleanUrl(rawApiUrl);

    // 1. Ação: Verificar Status de Conexão da Instância
    if (action === 'checkConnection') {
      const stateUrl = `${apiUrl}/instance/connectionState/${instanceName}`;
      try {
        const evoRes = await fetch(stateUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
        });

        const evoData = (await evoRes.json()) as {
          instance?: { state?: string };
          state?: string;
          status?: number;
          error?: string;
          message?: string;
        };

        const state = evoData?.instance?.state || evoData?.state || 'unknown';
        const isOpen = state.toLowerCase() === 'open';

        return new Response(
          JSON.stringify({
            success: evoRes.ok,
            state,
            isOpen,
            message: isOpen
              ? 'Instância conectada e pronta no WhatsApp!'
              : `Instância status: ${state}`,
            raw: evoData,
          }),
          { headers: jsonHeaders }
        );
      } catch (checkErr: unknown) {
        const errorMsg = checkErr instanceof Error ? checkErr.message : 'Falha ao consultar Evolution API';
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    // 2. Ação: Enviar Mensagem de Texto
    const rawPhone = body.number || context.env.DEFAULT_WHATSAPP_PHONE || '';
    const phone = cleanPhone(rawPhone);
    const text = (body.text || '').trim();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Número de WhatsApp de destino não informado' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mensagem vazia' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const endpoint = `${apiUrl}/message/sendText/${instanceName}`;

    // Payload compatível com Evolution API v2 e v1.8+
    const payload = {
      number: phone,
      text: text,
      delay: typeof body.delay === 'number' ? body.delay : 1200,
      linkPreview: true,
    };

    const evoRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const evoData = (await evoRes.json()) as Record<string, any>;

    if (!evoRes.ok) {
      const errorMsg =
        evoData?.response?.message ||
        evoData?.message ||
        evoData?.error ||
        `Erro retornado pela Evolution API (HTTP ${evoRes.status})`;

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          details: evoData,
        }),
        { status: evoRes.status, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lembrete enviado com sucesso pelo WhatsApp via Evolution API!',
        data: evoData,
      }),
      { headers: jsonHeaders }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro interno ao conectar à Evolution API';
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: jsonHeaders }
    );
  }
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, apikey',
    },
  });
};
