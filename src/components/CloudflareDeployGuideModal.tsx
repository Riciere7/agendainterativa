import React, { useState } from 'react';
import { X, Cloud, Terminal, CheckCircle2, Copy, Check, Globe, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';

interface CloudflareDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployGuideModal: React.FC<CloudflareDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Guia de Hospedagem no Cloudflare Pages 🚀</h3>
              <p className="text-xs text-gray-500">
                100% Gratuito, ultra-rápido, com HTTPS e API serverless automática
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Highlight banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Pronto para o Cloudflare Pages!</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              O projeto já inclui todas as configurações do Cloudflare Pages: SPA redirects (<code className="font-mono bg-white px-1 py-0.5 rounded text-orange-700">_redirects</code>), cabeçalhos de segurança (<code className="font-mono bg-white px-1 py-0.5 rounded text-orange-700">_headers</code>) e a função serverless do Telegram em <code className="font-mono bg-white px-1 py-0.5 rounded text-orange-700">functions/api/send-telegram.ts</code>.
            </p>
          </div>

          {/* Option 1: Git GitHub deploy (Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-gray-900 text-sm">
                Opção 1 (Recomendada): Conectar ao GitHub / GitLab
              </h4>
            </div>

            <div className="ml-8 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <p>
                1. Suba este projeto para um repositório no seu GitHub.
              </p>
              <p>
                2. No painel do <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-orange-600 font-bold underline">Cloudflare Dashboard</a>, vá em <strong>Workers & Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.
              </p>
              <p>
                3. Selecione o repositório e preencha as configurações de build:
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-xs space-y-1.5 shadow-inner">
                <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-1 mb-2">
                  <span>Configurações de Build no Cloudflare:</span>
                </div>
                <div><strong>Framework preset:</strong> Vite</div>
                <div><strong>Build command:</strong> npm run build</div>
                <div><strong>Build output directory:</strong> dist</div>
              </div>

              <p className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pronto! Em 40 segundos seu link público <code className="bg-emerald-50 px-1 py-0.5 rounded">https://agenda-esposa.pages.dev</code> estará no ar com HTTPS gratuito!
              </p>
            </div>
          </div>

          {/* Option 2: Wrangler CLI */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-800 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-gray-900 text-sm">
                Opção 2: Deploy Direto via Terminal (Wrangler CLI)
              </h4>
            </div>

            <div className="ml-8 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <p>Você pode fazer o deploy diretamente do seu computador rodando:</p>

              <div className="bg-gray-900 text-gray-100 p-3.5 rounded-2xl font-mono text-xs flex items-center justify-between">
                <code>npm run build; npx wrangler pages deploy dist --project-name agenda-esposa</code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm run build; npx wrangler pages deploy dist --project-name agenda-esposa',
                      1
                    )
                  }
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 cursor-pointer"
                  title="Copiar comando"
                >
                  {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* PWA Phone installation guide */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <span>Como ela instala no Celular como App Nativo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
              <div className="p-3 bg-white rounded-xl border border-rose-100">
                <span className="font-bold text-gray-900 block mb-1">📱 No iPhone (Safari):</span>
                <span>Abra o link do Cloudflare no Safari, toque no ícone de <strong>Compartilhar</strong> (quadradinho com seta) e escolha <strong>"Adicionar à Tela de Início"</strong>.</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-rose-100">
                <span className="font-bold text-gray-900 block mb-1">🤖 No Android (Chrome):</span>
                <span>Abra no Google Chrome, toque nos <strong>3 pontinhos</strong> no canto superior e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Entendi, Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
