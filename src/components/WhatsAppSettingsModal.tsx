import React, { useState } from 'react';
import { WhatsAppConfig } from '../types';
import { X, Send, CheckCircle, Smartphone, Key, Settings, HelpCircle, Volume2, Heart, ExternalLink, Loader2 } from 'lucide-react';
import { getDirectWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onSaveConfig: (config: WhatsAppConfig) => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<WhatsAppConfig>({ ...config });
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showCallMeBotGuide, setShowCallMeBotGuide] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleTestWhatsApp = async () => {
    setIsTesting(true);
    setTestStatus(null);

    const cleanPhone = formData.wifePhone.replace(/\D/g, '');
    if (!cleanPhone) {
      setTestStatus('Por favor, informe o número do WhatsApp da sua esposa antes de testar.');
      setIsTesting(false);
      return;
    }

    const testMessage = `✨ *TESTE DA SUA AGENDA INTERATIVA* ✨\n\n` +
      `Oi, ${formData.wifeName || 'meu amor'}! 💕\n` +
      `Este é um teste do sistema de alertas da sua nova agenda.\n` +
      `Aqui você receberá lembretes automáticos dos seus estudos, trabalhos e compromissos especiais para nunca esquecer nada!\n\n` +
      `Com todo o carinho,\n${formData.husbandName || 'Seu Amor'} ❤️`;

    // Try sending through API
    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: testMessage,
          provider: formData.provider,
          callmebotApiKey: formData.callmebotApiKey,
          evolutionApiUrl: formData.evolutionApiUrl,
          evolutionApiKey: formData.evolutionApiKey,
          evolutionInstanceName: formData.evolutionInstanceName,
        }),
      });

      if (response.ok) {
        setTestStatus('✅ Mensagem de teste enviada com sucesso no WhatsApp!');
        setIsTesting(false);
        return;
      }
    } catch {
      // ignore
    }

    // Direct CallMeBot client call fallback
    if (formData.provider === 'callmebot' && formData.callmebotApiKey) {
      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(testMessage)}&apikey=${formData.callmebotApiKey}`;
        await fetch(url, { mode: 'no-cors' });
        setTestStatus('✅ Alerta disparado com sucesso via CallMeBot!');
        setIsTesting(false);
        return;
      } catch {
        // fallback
      }
    }

    // Manual wa.me fallback
    const directUrl = getDirectWhatsAppUrl(cleanPhone, testMessage);
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    setTestStatus('💬 Abrindo WhatsApp Web / App para você confirmar o envio de teste!');
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Configurações de Alerta WhatsApp</h3>
              <p className="text-xs text-gray-500">
                Personalize os avisos e conecte o WhatsApp da sua esposa
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

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Couple's Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Nome da Esposa 💕
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Isa, Meu Amor, Mari..."
                value={formData.wifeName}
                onChange={(e) => setFormData({ ...formData, wifeName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Seu Nome (Marido) 💍
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Seu Marido, Lucas, Amor..."
                value={formData.husbandName}
                onChange={(e) => setFormData({ ...formData, husbandName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              WhatsApp dela (com DDI e DDD) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: 5511999999999 (55 + DDD + Número)"
                value={formData.wifePhone}
                onChange={(e) => setFormData({ ...formData, wifePhone: e.target.value })}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Coloque o código do Brasil (55), o DDD e o número completo sem espaços ou traços.
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Método de Envio dos Alertas
            </label>

            <div className="space-y-2">
              {/* CallMeBot */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                <input
                  type="radio"
                  name="provider"
                  value="callmebot"
                  checked={formData.provider === 'callmebot'}
                  onChange={() => setFormData({ ...formData, provider: 'callmebot' })}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <span>CallMeBot (100% Gratuito & Recomendado)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Automático
                    </span>
                  </div>
                  <p className="text-gray-500 mt-0.5">
                    Envia mensagens diretas para o WhatsApp dela em segundo plano sem você precisar clicar em nada.
                  </p>
                </div>
              </label>

              {/* Manual Direct wa.me */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                <input
                  type="radio"
                  name="provider"
                  value="manual"
                  checked={formData.provider === 'manual'}
                  onChange={() => setFormData({ ...formData, provider: 'manual' })}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-gray-900">Link Direto WhatsApp (1 Clique)</div>
                  <p className="text-gray-500 mt-0.5">
                    Não precisa de nenhuma chave de API. Abre o WhatsApp com a mensagem carinhosa já formatada pronta para enviar.
                  </p>
                </div>
              </label>

              {/* Evolution API */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer bg-white">
                <input
                  type="radio"
                  name="provider"
                  value="evolution"
                  checked={formData.provider === 'evolution'}
                  onChange={() => setFormData({ ...formData, provider: 'evolution' })}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-gray-900">Evolution API / Z-API (Avançado)</div>
                  <p className="text-gray-500 mt-0.5">
                    Para quem já possui uma instância própria de WhatsApp API configurada em VPS.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* CallMeBot Settings details */}
          {formData.provider === 'callmebot' && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  Chave API do CallMeBot
                </span>
                <button
                  type="button"
                  onClick={() => setShowCallMeBotGuide(!showCallMeBotGuide)}
                  className="text-xs text-emerald-700 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  Como conseguir a chave em 10 segundos
                </button>
              </div>

              <input
                type="text"
                placeholder="Cole aqui a sua API Key (Ex: 1234567)"
                value={formData.callmebotApiKey || ''}
                onChange={(e) => setFormData({ ...formData, callmebotApiKey: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              {showCallMeBotGuide && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-gray-700 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-emerald-800">Passo a passo rápido no WhatsApp dela:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>
                      Abra uma conversa com o número oficial do bot:{' '}
                      <a
                        href="https://wa.me/34911061436?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5"
                      >
                        +34 911 06 14 36 <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      Envie exatamente a mensagem:{' '}
                      <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">
                        I allow callmebot to send me messages
                      </code>
                    </li>
                    <li>
                      O bot responderá imediatamente com sua <strong>apikey</strong>. Cole-a no campo acima!
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Evolution API Details */}
          {formData.provider === 'evolution' && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <span className="text-xs font-bold text-indigo-900">Parâmetros da Evolution API:</span>
              <input
                type="text"
                placeholder="URL da API (Ex: https://api.meuservidor.com)"
                value={formData.evolutionApiUrl || ''}
                onChange={(e) => setFormData({ ...formData, evolutionApiUrl: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-300 bg-white"
              />
              <input
                type="text"
                placeholder="API Key / Token"
                value={formData.evolutionApiKey || ''}
                onChange={(e) => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-300 bg-white"
              />
              <input
                type="text"
                placeholder="Nome da Instância (Ex: agenda)"
                value={formData.evolutionInstanceName || ''}
                onChange={(e) => setFormData({ ...formData, evolutionInstanceName: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-300 bg-white"
              />
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Incluir frase carinhosa e motivacional nos lembretes
              </span>
              <input
                type="checkbox"
                checked={formData.sweetMessageSuffix}
                onChange={(e) => setFormData({ ...formData, sweetMessageSuffix: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-400"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                Ativar sons suaves de sino e comemoração no app
              </span>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="rounded text-indigo-500 focus:ring-indigo-400"
              />
            </label>
          </div>

          {/* Test Button & Status */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Enviando teste para o WhatsApp...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Testar Alerta no WhatsApp Dela Agora</span>
                </>
              )}
            </button>

            {testStatus && (
              <p className="mt-2 text-xs text-center font-medium text-emerald-700 animate-fade-in">
                {testStatus}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
