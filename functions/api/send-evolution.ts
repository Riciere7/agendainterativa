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

async function parseResponseJson(res: Response): Promise<{ ok: boolean; data: any; rawText: string }> {
  const rawText = await res.text();
  try {
    const data = JSON.parse(rawText);
    return { ok: true, data, rawText };
  } catch {
    return { ok: false, data: null, rawText };
  }
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
      action?: 'sendText' | 'checkConnection' | 'getQrCode' | 'logout';
      apiUrl?: string;
      apiKey?: string;
      instanceName?: string;
      number?: string;
      text?: string;
      delay?: number;
    };

    const action = body.action || 'sendText';
    const rawApiUrl = body.apiUrl || context.env.EVOLUTION_API_URL || 'https://143.95.186.93';
    const apiKey = (body.apiKey || context.env.EVOLUTION_API_KEY || '842CB014124C-4D07-8662-8D06B06659A0').trim();
    const instanceName = (body.instanceName || context.env.EVOLUTION_INSTANCE_NAME || 'AGENDAINTERATIVA').trim();

    if (!rawApiUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL da Evolution API não informada' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const apiUrl = cleanUrl(rawApiUrl);

    // Se for IP direto (ex: https://143.95.186.93), o Cloudflare Workers edge rejeita conexões de saída
    // para endereços IP numéricos (Erro 1003 - Direct IP Access Not Allowed).
    // O cliente deve efetuar a conexão diretamente pelo navegador, que já possui CORS autorizado.
    const isDirectIp = /^https?:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?/.test(apiUrl);
    if (isDirectIp) {
      return new Response(
        JSON.stringify({
          success: false,
          isDirectIp: true,
          error: 'A Cloudflare não permite requisições de backend para IP direto (Erro 1003). A aplicação deve conectar diretamente pelo navegador.',
        }),
        { status: 400, headers: jsonHeaders }
      );
    }

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

        const parsed = await parseResponseJson(evoRes);
        const evoData = parsed.data || {};
        const state = evoData?.instance?.state || evoData?.state || (parsed.ok ? 'unknown' : 'error');
        const isOpen = state.toLowerCase() === 'open';

        return new Response(
          JSON.stringify({
            success: evoRes.ok && parsed.ok,
            state,
            isOpen,
            instanceName,
            message: isOpen
              ? 'Instância conectada e pronta no WhatsApp! 🟢'
              : `Instância status: ${state}`,
            raw: evoData,
            error: !parsed.ok ? parsed.rawText.slice(0, 150) : undefined,
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

    // 2. Ação: Obter QR Code para Leitura no WhatsApp
    if (action === 'getQrCode') {
      const qrUrl = `${apiUrl}/instance/connect/${instanceName}`;
      try {
        const evoRes = await fetch(qrUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
        });

        const parsed = await parseResponseJson(evoRes);
        const evoData = parsed.data || {};
        const base64 = evoData?.base64 || '';
        const code = evoData?.code || '';

        return new Response(
          JSON.stringify({
            success: evoRes.ok && Boolean(base64 || code),
            base64,
            code,
            pairingCode: evoData?.pairingCode || null,
            message: base64
              ? 'QR Code gerado com sucesso! Escaneie com o WhatsApp da sua esposa.'
              : 'QR Code indisponível ou instância já conectada.',
            raw: evoData,
            error: !parsed.ok ? parsed.rawText.slice(0, 150) : undefined,
          }),
          { headers: jsonHeaders }
        );
      } catch (qrErr: unknown) {
        const errorMsg = qrErr instanceof Error ? qrErr.message : 'Falha ao buscar QR Code na Evolution API';
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    // 3. Ação: Reiniciar Instância
    if (action === 'restart') {
      const restartUrl = `${apiUrl}/instance/restart/${instanceName}`;
      try {
        const evoRes = await fetch(restartUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
        });

        const parsed = await parseResponseJson(evoRes);
        const evoData = parsed.data || {};
        return new Response(
          JSON.stringify({
            success: evoRes.ok && parsed.ok,
            message: evoRes.ok ? 'Instância reiniciada com sucesso.' : 'Falha ao reiniciar.',
            raw: evoData,
            error: !parsed.ok ? parsed.rawText.slice(0, 150) : undefined,
          }),
          { headers: jsonHeaders }
        );
      } catch (restartErr: unknown) {
        const errorMsg = restartErr instanceof Error ? restartErr.message : 'Falha ao reiniciar Evolution API';
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    // 4. Ação: Desconectar Instância (Logout)
    if (action === 'logout') {
      const logoutUrl = `${apiUrl}/instance/logout/${instanceName}`;
      try {
        const evoRes = await fetch(logoutUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
        });

        const parsed = await parseResponseJson(evoRes);
        const evoData = parsed.data || {};
        return new Response(
          JSON.stringify({
            success: evoRes.ok && parsed.ok,
            message: evoRes.ok ? 'Instância desconectada com sucesso.' : 'Falha ao desconectar.',
            raw: evoData,
            error: !parsed.ok ? parsed.rawText.slice(0, 150) : undefined,
          }),
          { headers: jsonHeaders }
        );
      } catch (logoutErr: unknown) {
        const errorMsg = logoutErr instanceof Error ? logoutErr.message : 'Falha ao desconectar da Evolution API';
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    // 4. Ação: Enviar Mensagem de Texto
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

    const parsed = await parseResponseJson(evoRes);
    const evoData = parsed.data || {};

    if (!evoRes.ok || !parsed.ok) {
      const errorMsg =
        evoData?.response?.message ||
        evoData?.message ||
        evoData?.error ||
        (!parsed.ok ? parsed.rawText.slice(0, 150) : `Erro retornado pela Evolution API (HTTP ${evoRes.status})`);

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
