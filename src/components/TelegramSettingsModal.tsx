import React, { useState } from 'react';
import { TelegramConfig } from '../types';
import {
  X,
  Send,
  CheckCircle,
  Key,
  HelpCircle,
  Volume2,
  Heart,
  ExternalLink,
  Loader2,
  Bot,
  MessageSquare,
  Users,
} from 'lucide-react';
import { sendRawTelegramMessage } from '../utils/telegram';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (config: TelegramConfig) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<TelegramConfig>({ ...config });
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleTestTelegram = async () => {
    setIsTesting(true);
    setTestStatus(null);

    if (!formData.botToken.trim() || !formData.chatId.trim()) {
      setTestStatus('Por favor, informe o Bot Token e o Chat ID antes de testar.');
      setIsTesting(false);
      return;
    }

    const testMessage =
      `✨ <b>TESTE DA SUA AGENDA INTERATIVA NO TELEGRAM</b> ✨\n\n` +
      `Oi, <b>${formData.wifeName || 'meu amor'}</b>! 💕\n` +
      `Este é o seu bot oficial de lembretes no Telegram!\n\n` +
      `🚀 <b>Vantagens ativadas:</b>\n` +
      `• 100% Gratuito e Ilimitado (sem bloqueios do WhatsApp)\n` +
      `• Notificações instantâneas no seu celular\n` +
      `• Alertas dos seus estudos, trabalhos e datas importantes\n\n` +
      `Com todo o carinho e admiração,\n` +
      `<b>${formData.husbandName || 'Seu Marido'}</b> ❤️`;

    try {
      const res = await sendRawTelegramMessage(testMessage, formData);
      if (res.success) {
        setTestStatus('✅ Mensagem de teste enviada com sucesso no Telegram! Verifique o aplicativo.');
      } else {
        setTestStatus(`⚠️ ${res.message}`);
      }
    } catch {
      setTestStatus('Erro inesperado ao conectar com a API do Telegram.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Configurações de Alerta Telegram</h3>
              <p className="text-xs text-gray-500">
                100% Gratuito, ilimitado e sem bloqueios para sua esposa
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
                placeholder="Ex: Isa, Mari, Meu Bem..."
                value={formData.wifeName}
                onChange={(e) => setFormData({ ...formData, wifeName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Seu Nome (Marido) 💍
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Lucas, Seu Amor, Maridinho..."
                value={formData.husbandName}
                onChange={(e) => setFormData({ ...formData, husbandName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Telegram Bot Token */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-sky-500" />
                Telegram Bot Token *
              </label>
              <button
                type="button"
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-xs text-sky-600 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                Como criar o bot em 30 segundos
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Ex: 7123456789:AAHqKlxabcdef12345..."
              value={formData.botToken}
              onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
            />
          </div>

          {/* Telegram Chat ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
              Chat ID da Esposa (ou do Casal) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 123456789 ou -100123456789 (se for grupo)"
              value={formData.chatId}
              onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Pode ser o ID pessoal dela no Telegram ou um grupo com vocês dois + o bot!
            </p>
          </div>

          {/* Tutorial Card */}
          {showTutorial && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs text-gray-700 space-y-3 leading-relaxed animate-fade-in">
              <div className="font-bold text-sky-900 flex items-center gap-1.5 text-sm">
                <Bot className="w-4 h-4 text-sky-600" />
                <span>Passo a passo rápido no Telegram:</span>
              </div>

              <div className="space-y-2">
                <div className="bg-white p-3 rounded-xl border border-sky-100">
                  <p className="font-bold text-gray-900 mb-1">1. Criar o Bot (Token):</p>
                  <p className="text-gray-600 mb-1.5">
                    Abra o{' '}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @BotFather no Telegram <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    e envie o comando <code className="bg-sky-100 px-1 py-0.5 rounded text-sky-900 font-mono">/newbot</code>.
                  </p>
                  <p className="text-gray-600">
                    Ele pedirá um nome (ex: <i>Agenda da Minha Esposa</i>) e um username (ex: <i>AgendaAmor_bot</i>). Ao terminar, ele entregará o <b>HTTP API Token</b>. Cole no campo acima!
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-sky-100">
                  <p className="font-bold text-gray-900 mb-1">2. Descobrir o Chat ID:</p>
                  <p className="text-gray-600 mb-1.5">
                    Abra uma conversa com o seu bot recém-criado e clique em <b>Iniciar / Start</b>.
                  </p>
                  <p className="text-gray-600 mb-1.5">
                    Depois, abra o bot{' '}
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @userinfobot <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    no Telegram. Ele responderá imediatamente com o seu <b>Id</b> numérico (ex: <code>987654321</code>). Cole no campo acima!
                  </p>
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-sky-800 text-[11px] font-medium">
                    <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>
                      Dica: Se preferir, crie um grupo no Telegram com você e sua esposa, adicione seu bot lá e use o ID do grupo para ambos serem alertados!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bot Activation Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
            <Bot className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Aviso importante do Telegram:</span>
              <p className="text-gray-600 leading-relaxed">
                Por segurança anti-spam, o Telegram só autoriza o bot a enviar mensagens se a sua esposa clicar em <b>Iniciar (Start)</b> uma única vez na conversa com o bot.
              </p>
              <a
                href="https://t.me/agentamor_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline mt-1"
              >
                <span>Clique aqui para abrir @agentamor_bot no Telegram dela</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

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
                className="rounded text-sky-500 focus:ring-sky-400"
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
              onClick={handleTestTelegram}
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Enviando teste para o Telegram...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Testar Alerta no Telegram Dela Agora</span>
                </>
              )}
            </button>

            {testStatus && (
              <p
                className={`mt-2 text-xs text-center font-medium animate-fade-in ${
                  testStatus.startsWith('✅') ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
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
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-200 transition-all cursor-pointer flex items-center gap-1.5"
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
