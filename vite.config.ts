import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Recusa a verificação estrita de certificado SSL para permitir conexões à Evolution API com IP ou certificado autoassinado
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function evolutionApiDevPlugin(): Plugin {
  return {
    name: 'evolution-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/send-evolution', (req, res) => {
        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');

            try {
              const body = JSON.parse(bodyStr || '{}');
              const action = body.action || 'sendText';
              const rawApiUrl = body.apiUrl || 'https://143.95.186.93';
              const apiUrl = rawApiUrl.trim().replace(/\/+$/, '');
              const apiKey = (body.apiKey || '842CB014124C-4D07-8662-8D06B06659A0').trim();
              const instanceName = (body.instanceName || 'AGENDAINTERATIVA').trim();

              if (action === 'checkConnection') {
                const evoRes = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
                  headers: { apikey: apiKey },
                });
                const evoData = (await evoRes.json()) as {
                  instance?: { state?: string };
                  state?: string;
                };
                const state = evoData?.instance?.state || evoData?.state || 'unknown';
                const isOpen = state.toLowerCase() === 'open';

                res.statusCode = evoRes.status;
                res.end(
                  JSON.stringify({
                    success: evoRes.ok,
                    state,
                    isOpen,
                    instanceName,
                    message: isOpen
                      ? 'Instância conectada e pronta no WhatsApp! 🟢'
                      : `Instância status: ${state}`,
                    raw: evoData,
                  })
                );
                return;
              }

              if (action === 'getQrCode') {
                const evoRes = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
                  headers: { apikey: apiKey },
                });
                const evoData = (await evoRes.json()) as {
                  base64?: string;
                  code?: string;
                  pairingCode?: string;
                };
                const base64 = evoData?.base64 || '';
                const code = evoData?.code || '';

                res.statusCode = evoRes.status;
                res.end(
                  JSON.stringify({
                    success: evoRes.ok && Boolean(base64 || code),
                    base64,
                    code,
                    pairingCode: evoData?.pairingCode || null,
                    message: base64
                      ? 'QR Code gerado com sucesso!'
                      : 'QR Code indisponível ou instância já conectada.',
                    raw: evoData,
                  })
                );
                return;
              }

              if (action === 'restart') {
                const evoRes = await fetch(`${apiUrl}/instance/restart/${instanceName}`, {
                  method: 'POST',
                  headers: { apikey: apiKey },
                });
                const evoData = await evoRes.json();
                res.statusCode = evoRes.status;
                res.end(
                  JSON.stringify({
                    success: evoRes.ok,
                    message: 'Instância reiniciada com sucesso.',
                    raw: evoData,
                  })
                );
                return;
              }

              if (action === 'logout') {
                const evoRes = await fetch(`${apiUrl}/instance/logout/${instanceName}`, {
                  method: 'DELETE',
                  headers: { apikey: apiKey },
                });
                const evoData = await evoRes.json();
                res.statusCode = evoRes.status;
                res.end(
                  JSON.stringify({
                    success: evoRes.ok,
                    message: 'Instância desconectada com sucesso.',
                    raw: evoData,
                  })
                );
                return;
              }

              // action === 'sendText'
              let cleanPhone = (body.number || '').replace(/\D/g, '');
              if (cleanPhone.length === 10 || cleanPhone.length === 11) {
                cleanPhone = `55${cleanPhone}`;
              }

              const evoRes = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  apikey: apiKey,
                },
                body: JSON.stringify({
                  number: cleanPhone,
                  text: body.text || '',
                  delay: typeof body.delay === 'number' ? body.delay : 1200,
                  linkPreview: true,
                }),
              });

              const evoData = (await evoRes.json()) as Record<string, any>;
              res.statusCode = evoRes.status;

              if (!evoRes.ok) {
                const errorMsg =
                  evoData?.response?.message ||
                  evoData?.message ||
                  evoData?.error ||
                  `Erro retornado pela Evolution API (${evoRes.status})`;
                res.end(JSON.stringify({ success: false, error: errorMsg, details: evoData }));
                return;
              }

              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Lembrete enviado com sucesso pelo WhatsApp via Evolution API!',
                  data: evoData,
                })
              );
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : 'Erro interno no proxy';
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: errorMsg }));
            }
          });
        } else if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey');
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    evolutionApiDevPlugin(),
  ],
  server: {
    proxy: {
      '/api/evolution-proxy': {
        target: 'https://143.95.186.93',
        changeOrigin: true,
        secure: false, // Recusa verificação de certificado HTTPS
        rewrite: (path) => path.replace(/^\/api\/evolution-proxy/, ''),
      },
    },
  },
});
