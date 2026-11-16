import React, { useState, useEffect, useRef } from 'react';
import { NotificationConfig } from '../types';
import {
  X,
  Send,
  CheckCircle,
  Key,
  Volume2,
  Heart,
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
  QrCode,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  checkEvolutionConnection,
  fetchEvolutionQrCode,
  logoutEvolutionInstance,
  restartEvolutionInstance,
  sendEvolutionTextMessage,
} from '../utils/evolution';
import { sendRawTelegramMessage } from '../utils/telegram';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

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
  const [formData, setFormData] = useState<NotificationConfig>({
    ...config,
    evolutionApiUrl: config.evolutionApiUrl || 'https://143.95.186.93',
    evolutionInstanceName: config.evolutionInstanceName || 'AGENDAINTERATIVA',
    evolutionApiKey: config.evolutionApiKey || '842CB014124C-4D07-8662-8D06B06659A0',
    channel: config.channel || 'evolution',
  });

  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'open' | 'close' | 'connecting' | 'unknown'>('unknown');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Verifica status da conexão ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      handleCheckConnection(false);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleCheckConnection = async (showFeedback = true) => {
    setIsCheckingConnection(true);
    if (showFeedback) setTestStatus(null);

    try {
      const res = await checkEvolutionConnection(formData);
      const state = (res.state?.toLowerCase() || 'unknown') as 'open' | 'close' | 'connecting' | 'unknown';
      setConnectionState(state);

      if (res.isOpen) {
        setQrCodeData(null);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (showFeedback) {
          setTestStatus({
            type: 'success',
            message: 'Instância AGENDAINTERATIVA está conectada e pronta no WhatsApp! 🟢',
          });
        }
      } else if (showFeedback) {
        setTestStatus({
          type: 'info',
          message: `Status da instância: ${res.state}. Escaneie o QR Code abaixo para conectar o WhatsApp.`,
        });
      }
    } catch {
      setConnectionState('unknown');
      if (showFeedback) {
        setTestStatus({
          type: 'error',
          message: 'Falha ao verificar status da Evolution API.',
        });
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleFetchQrCode = async () => {
    setIsLoadingQr(true);
    setTestStatus(null);

    try {
      const res = await fetchEvolutionQrCode(formData);
      if (res.success && res.base64) {
        setQrCodeData(res.base64);
        setTestStatus({
          type: 'info',
          message: 'QR Code pronto! Abra o WhatsApp no celular e aponte a câmera para conectar.',
        });

        // Inicia polling a cada 3 segundos para detectar quando o usuário ler o QR Code
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          const statusRes = await checkEvolutionConnection(formData);
          if (statusRes.isOpen) {
            setConnectionState('open');
            setQrCodeData(null);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            soundEffects.playSuccess();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
            });
            setTestStatus({
              type: 'success',
              message: '🎉 WhatsApp conectado com sucesso via Evolution API!',
            });
          }
        }, 3000);
      } else {
        setTestStatus({
          type: 'error',
          message: res.message || 'Não foi possível gerar o QR Code. Verifique se a instância já está conectada.',
        });
        handleCheckConnection(false);
      }
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Erro ao solicitar QR Code à Evolution API.',
      });
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Deseja realmente desconectar este WhatsApp da instância AGENDAINTERATIVA?')) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await logoutEvolutionInstance(formData);
      setConnectionState('close');
      setQrCodeData(null);
      setTestStatus({
        type: 'info',
        message: 'WhatsApp desconectado. Gere um novo QR Code para reconectar quando quiser.',
      });
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Erro ao desconectar instância.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRestartInstance = async () => {
    setIsRestarting(true);
    setTestStatus(null);
    try {
      await restartEvolutionInstance(formData);
      setConnectionState('connecting');
      setTestStatus({
        type: 'info',
        message: 'Instância reiniciada! Gerando novo QR Code limpo...',
      });
      await handleFetchQrCode();
    } catch {
      setTestStatus({
        type: 'error',
        message: 'Falha ao reiniciar instância.',
      });
    } finally {
      setIsRestarting(false);
    }
  };

  const handleTestWhatsAppSend = async () => {
    setIsTestingSend(true);
    setTestStatus(null);

    if (!formData.whatsappNumber.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Informe o número do WhatsApp da esposa antes de testar o envio.',
      });
      setIsTestingSend(false);
      return;
    }

    const testMessage =
      `✨ *TESTE DA SUA AGENDA INTERATIVA NO WHATSAPP* ✨\n\n` +
      `Oi, *${formData.wifeName || 'meu amor'}*! 💕\n` +
      `Seus lembretes automáticos estão ativos com sucesso via *Evolution API*!\n\n` +
      `🚀 *O que você receberá aqui:*\n` +
      `• Alertas dos seus estudos, aulas e provas\n` +
      `• Avisos de compromissos e reuniões no horário certo\n` +
      `• Roteiro do seu dia e bilhetinhos especiais de amor\n\n` +
      `Com todo o meu amor e carinho,\n` +
      `*${formData.husbandName || 'Seu Marido'}* ❤️`;

    try {
      const res = await sendEvolutionTextMessage(formData.whatsappNumber, testMessage, formData);
      if (res.success) {
        soundEffects.playSuccess();
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
      `Com carinho,\n` +
      `<b>${formData.husbandName || 'Seu Marido'}</b> ❤️`;

    try {
      const res = await sendRawTelegramMessage(testMessage, formData);
      if (res.success) {
        setTestStatus({
          type: 'success',
          message: 'Mensagem de teste enviada no Telegram!',
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

  const isConnected = connectionState === 'open';
  const isConnecting = connectionState === 'connecting';
  const channel = formData.channel || 'evolution';

  if (!isOpen) return null;

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
              <h3 className="text-lg font-bold text-gray-900">Configurações de Alertas & WhatsApp</h3>
              <p className="text-xs text-gray-500">
                Integração com Evolution API oficial para envio de lembretes no WhatsApp
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
                placeholder="Ex: Danielli, Meu Amor..."
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
                    Bot
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Canal alternativo via bot do Telegram
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
                    Simultâneo
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Envia no WhatsApp e no Telegram
                </p>
              </button>
            </div>
          </div>

          {/* QR Code & Live Connection Status Section (Always prominent for WhatsApp) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border-2 border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>Conexão WhatsApp (Evolution API)</span>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Conectado 🟢
                      </span>
                    ) : isConnecting ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Conectando / Aguardando QR Code 🟡
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Desconectado 🔴
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Instância: <strong className="font-mono">{formData.evolutionInstanceName || 'AGENDAINTERATIVA'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestartInstance}
                  disabled={isRestarting}
                  className="p-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Reiniciar a instância para limpar sessões e gerar QR Code novo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="hidden sm:inline">Reiniciar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckConnection(true)}
                  disabled={isCheckingConnection}
                  className="p-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Atualizar status da conexão"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConnection ? 'animate-spin text-emerald-600' : ''}`} />
                  <span className="hidden sm:inline">Verificar</span>
                </button>
              </div>
            </div>

            {/* Connection Status Box */}
            {isConnected ? (
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      WhatsApp Conectado e Pronto para Envio! 🟢
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Todos os avisos serão enviados automaticamente para o número cadastrado.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Desconectar este WhatsApp"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5 justify-center sm:justify-start">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>WhatsApp Desconectado</span>
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Clique no botão ao lado para exibir o QR Code e conectar seu WhatsApp
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchQrCode}
                    disabled={isLoadingQr}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-200 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoadingQr ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gerando QR Code...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>{qrCodeData ? 'Atualizar QR Code' : 'Escanear QR Code'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* QR Code Container */}
                {qrCodeData && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center space-y-3 animate-fade-in">
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100">
                      <img
                        src={qrCodeData}
                        alt="QR Code WhatsApp"
                        className="w-56 h-56 object-contain rounded-lg"
                      />
                    </div>

                    <div className="text-center max-w-sm space-y-1">
                      <p className="text-xs font-bold text-emerald-950 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                        <span>Aguardando leitura do QR Code...</span>
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Abra o WhatsApp &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong> e aponte para o código acima. A tela se atualizará automaticamente assim que for lido!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Evolution API Parameters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Dados da Instância Evolution API
                </h4>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL ignorado (Certificado aceito)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Recipient WhatsApp Phone (PRIMARY) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Número do WhatsApp da Esposa (com DDD) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321 ou 5511987654321"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-emerald-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  O DDI 55 do Brasil é incluído automaticamente ao enviar.
                </p>
              </div>

              {/* Evolution API URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-gray-500" />
                  Endereço da Evolution API *
                </label>
                <input
                  type="text"
                  required
                  value={formData.evolutionApiUrl}
                  onChange={(e) => setFormData({ ...formData, evolutionApiUrl: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>

              {/* Instance Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1">
                  <Server className="w-3 h-3 text-gray-500" />
                  Nome da Instância *
                </label>
                <input
                  type="text"
                  required
                  value={formData.evolutionInstanceName}
                  onChange={(e) => setFormData({ ...formData, evolutionInstanceName: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>

              {/* Evolution API Key / Token */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-gray-500" />
                    Chave de API (Token / apikey) *
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[10px] text-gray-500 hover:text-gray-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showApiKey ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </label>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  required
                  value={formData.evolutionApiKey}
                  onChange={(e) => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>
            </div>

            {/* Test WhatsApp Send Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestWhatsAppSend}
                disabled={isTestingSend || !formData.whatsappNumber}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingSend ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Disparando mensagem teste no WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Testar Envio no WhatsApp Dela Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Telegram Card (Only if Telegram or Both selected) */}
          {(channel === 'telegram' || channel === 'both') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs sm:text-sm font-bold text-sky-950">
                  Telegram Bot (Canal Alternativo)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sky-900 mb-1">
                    Bot Token
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 7123456789:AAHqKlx..."
                    value={formData.botToken}
                    onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-sky-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-sky-900 mb-1">
                    Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 987654321"
                    value={formData.chatId}
                    onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-sky-300 bg-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestTelegramSend}
                disabled={isTestingSend || !formData.botToken}
                className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Testar Envio no Telegram</span>
              </button>
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
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
