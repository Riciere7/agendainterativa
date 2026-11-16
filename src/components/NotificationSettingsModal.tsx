import React, { useState } from 'react';
import { NotificationConfig } from '../types';
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
  Smartphone,
  Globe,
  Radio,
  Eye,
  EyeOff,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  checkEvolutionConnection,
  sendEvolutionTextMessage,
} from '../utils/evolution';
import { sendRawTelegramMessage } from '../utils/telegram';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotificationConfig;
  onSaveConfig: (config: NotificationConfig) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<NotificationConfig>({ ...config });
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [showEvolutionGuide, setShowEvolutionGuide] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleCheckEvolutionConnection = async () => {
    setIsCheckingConnection(true);
    setTestStatus(null);

    if (!formData.evolutionApiUrl.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Por favor, informe a URL da sua Evolution API primeiro.',
      });
      setIsCheckingConnection(false);
      return;
    }

    try {
      const res = await checkEvolutionConnection(formData);
      if (res.isOpen) {
        setTestStatus({
          type: 'success',
          message: `Conexão bem-sucedida! Instância "${formData.evolutionInstanceName || 'agenda'}" está online e conectada ao WhatsApp! 🟢`,
        });
      } else if (res.success) {
        setTestStatus({
          type: 'info',
          message: `Instância encontrada, mas status atual é: "${res.state}". Se necessário, abra o painel da Evolution API e escaneie o QR Code. 🟡`,
        });
      } else {
        setTestStatus({
          type: 'error',
          message: res.message || 'Falha ao verificar conexão com a Evolution API.',
        });
      }
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Erro inesperado ao consultar a Evolution API.',
      });
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleTestWhatsAppSend = async () => {
    setIsTestingSend(true);
    setTestStatus(null);

    if (!formData.evolutionApiUrl.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Informe a URL da Evolution API antes de testar o envio.',
      });
      setIsTestingSend(false);
      return;
    }

    if (!formData.whatsappNumber.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Informe o número do WhatsApp da esposa antes de testar.',
      });
      setIsTestingSend(false);
      return;
    }

    const testMessage =
      `✨ *TESTE DA SUA AGENDA INTERATIVA NO WHATSAPP* ✨\n\n` +
      `Oi, *${formData.wifeName || 'meu amor'}*! 💕\n` +
      `Este é um teste oficial de notificação via *Evolution API*!\n\n` +
      `🚀 *Seus lembretes estão ativos:*\n` +
      `• Alertas automáticos dos seus estudos e trabalhos\n` +
      `• Notificações no horário certo direto no seu WhatsApp\n` +
      `• Roteiro diário e bilhetinhos especiais\n\n` +
      `Com todo o meu amor e carinho,\n` +
      `*${formData.husbandName || 'Seu Marido'}* ❤️`;

    try {
      const res = await sendEvolutionTextMessage(formData.whatsappNumber, testMessage, formData);
      if (res.success) {
        setTestStatus({
          type: 'success',
          message: 'Mensagem de teste enviada com sucesso no WhatsApp dela! Verifique o aplicativo. 📱✨',
        });
      } else {
        setTestStatus({
          type: 'error',
          message: res.message || 'Não foi possível enviar a mensagem no WhatsApp.',
        });
      }
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Erro inesperado ao tentar disparar mensagem via Evolution API.',
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  const handleTestTelegramSend = async () => {
    setIsTestingSend(true);
    setTestStatus(null);

    if (!formData.botToken.trim() || !formData.chatId.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Informe o Bot Token e o Chat ID do Telegram antes de testar.',
      });
      setIsTestingSend(false);
      return;
    }

    const testMessage =
      `✨ <b>TESTE DA SUA AGENDA INTERATIVA NO TELEGRAM</b> ✨\n\n` +
      `Oi, <b>${formData.wifeName || 'meu amor'}</b>! 💕\n` +
      `Este é um teste do seu bot oficial de lembretes no Telegram!\n\n` +
      `Com carinho,\n` +
      `<b>${formData.husbandName || 'Seu Marido'}</b> ❤️`;

    try {
      const res = await sendRawTelegramMessage(testMessage, formData);
      if (res.success) {
        setTestStatus({
          type: 'success',
          message: 'Mensagem de teste enviada com sucesso no Telegram!',
        });
      } else {
        setTestStatus({
          type: 'error',
          message: res.message,
        });
      }
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Erro ao conectar com a API do Telegram.',
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  const channel = formData.channel || 'evolution';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Configurações de Alertas & Notificações</h3>
              <p className="text-xs text-gray-500">
                Integração com Evolution API (WhatsApp) e Telegram para sua esposa
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

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Couple's Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Nome da Esposa 💕
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Danielli, Mari, Meu Amor..."
                value={formData.wifeName}
                onChange={(e) => setFormData({ ...formData, wifeName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Seu Nome (Marido) 💍
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Seu Amor, Maridinho..."
                value={formData.husbandName}
                onChange={(e) => setFormData({ ...formData, husbandName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              Canal de Envio dos Alertas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp Evolution Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'evolution' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  channel === 'evolution'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Evolution API
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Lembretes direto no WhatsApp pessoal dela
                </p>
              </button>

              {/* Telegram Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'telegram' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  channel === 'telegram'
                    ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <Bot className="w-4 h-4 text-sky-600" />
                    <span>Telegram</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                    Bot Oficial
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Mensagens formatadas pelo bot no Telegram
                </p>
              </button>

              {/* Both Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'both' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  channel === 'both'
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Ambos</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    WhatsApp + TG
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Envia nos dois canais simultaneamente
                </p>
              </button>
            </div>
          </div>

          {/* Evolution API Configuration Card */}
          {(channel === 'evolution' || channel === 'both') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-600 text-white">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Parâmetros da Evolution API (WhatsApp)
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Integração oficial de envio de mensagens via WhatsApp
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEvolutionGuide(!showEvolutionGuide)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showEvolutionGuide ? 'Ocultar Guia' : 'Como Configurar'}</span>
                </button>
              </div>

              {/* Collapsible Guide */}
              {showEvolutionGuide && (
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-gray-700 space-y-2.5 animate-fade-in">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Como obter os dados na sua Evolution API:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600 leading-relaxed text-[11px] sm:text-xs">
                    <li>
                      <strong>URL da API:</strong> O endereço do seu servidor onde a Evolution API está rodando (ex:{' '}
                      <code className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-900 font-mono">
                        https://api.meuservidor.com
                      </code>{' '}
                      ou{' '}
                      <code className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-900 font-mono">
                        http://localhost:8080
                      </code>
                      ).
                    </li>
                    <li>
                      <strong>API Key (Global ou da Instância):</strong> A chave definida no seu{' '}
                      <code className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-900 font-mono">
                        AUTHENTICATION_API_KEY
                      </code>{' '}
                      da Evolution API.
                    </li>
                    <li>
                      <strong>Nome da Instância:</strong> O nome da instância criada (ex:{' '}
                      <code className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-900 font-mono">agenda</code>).
                    </li>
                    <li>
                      <strong>WhatsApp da Esposa:</strong> O número do WhatsApp com DDD (o DDI 55 do Brasil é incluído automaticamente caso não informado).
                    </li>
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Evolution API URL */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    URL da Evolution API *
                  </label>
                  <input
                    type="url"
                    required={channel === 'evolution' || channel === 'both'}
                    placeholder="Ex: https://api.meudominio.com.br ou http://localhost:8080"
                    value={formData.evolutionApiUrl}
                    onChange={(e) => setFormData({ ...formData, evolutionApiUrl: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>

                {/* Evolution API Key */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-600" />
                      API Key (apikey) *
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showApiKey ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                  </label>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Chave de autenticação"
                    value={formData.evolutionApiKey}
                    onChange={(e) => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>

                {/* Instance Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                    <Server className="w-3 h-3 text-emerald-600" />
                    Nome da Instância *
                  </label>
                  <input
                    type="text"
                    required={channel === 'evolution' || channel === 'both'}
                    placeholder="Ex: agenda ou esposa"
                    value={formData.evolutionInstanceName}
                    onChange={(e) => setFormData({ ...formData, evolutionInstanceName: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>

                {/* Recipient WhatsApp Phone */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    Número do WhatsApp da Esposa *
                  </label>
                  <input
                    type="text"
                    required={channel === 'evolution' || channel === 'both'}
                    placeholder="Ex: (11) 98765-4321 ou 5511987654321"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Número de telefone com DDD que receberá os alertas no WhatsApp.
                  </p>
                </div>
              </div>

              {/* Action Buttons for Evolution */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckEvolutionConnection}
                  disabled={isCheckingConnection || !formData.evolutionApiUrl}
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCheckingConnection ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>Verificando Instância...</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verificar Conexão da Instância</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestWhatsAppSend}
                  disabled={isTestingSend || !formData.evolutionApiUrl || !formData.whatsappNumber}
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingSend ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Enviando no WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Testar Envio no WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Telegram Configuration Card */}
          {(channel === 'telegram' || channel === 'both') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/60 to-blue-50/40 border border-sky-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-sky-600 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-sky-950">
                      Parâmetros do Telegram Bot
                    </h4>
                    <p className="text-[11px] text-sky-700">
                      Canal de alertas pelo bot do Telegram
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTelegramGuide(!showTelegramGuide)}
                  className="text-xs text-sky-700 hover:text-sky-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showTelegramGuide ? 'Ocultar Guia' : 'Como Obter Token'}</span>
                </button>
              </div>

              {/* Collapsible Telegram Guide */}
              {showTelegramGuide && (
                <div className="p-3.5 rounded-xl bg-white border border-sky-200 text-xs text-gray-700 space-y-2 animate-fade-in text-[11px] sm:text-xs">
                  <p>
                    1. Crie um bot no Telegram com o{' '}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @BotFather <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    e envie <code className="bg-sky-50 px-1 py-0.5 rounded font-mono">/newbot</code> para receber o Token.
                  </p>
                  <p>
                    2. Abra o{' '}
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      @userinfobot <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    para descobrir o Chat ID numérico.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bot Token */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sky-900 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-sky-600" />
                    Telegram Bot Token *
                  </label>
                  <input
                    type="text"
                    required={channel === 'telegram'}
                    placeholder="Ex: 7123456789:AAHqKlxabcdef..."
                    value={formData.botToken}
                    onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  />
                </div>

                {/* Chat ID */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sky-900 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-sky-600" />
                    Chat ID da Esposa ou Grupo *
                  </label>
                  <input
                    type="text"
                    required={channel === 'telegram'}
                    placeholder="Ex: 987654321 ou -100123456789"
                    value={formData.chatId}
                    onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  />
                </div>
              </div>

              {/* Test Button for Telegram */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestTelegramSend}
                  disabled={isTestingSend || !formData.botToken || !formData.chatId}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-sky-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingSend ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Enviando no Telegram...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Testar Envio no Telegram</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Test Status Banner */}
          {testStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium border animate-fade-in ${
                testStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : testStatus.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {testStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
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
                className="rounded text-emerald-500 focus:ring-emerald-400"
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
