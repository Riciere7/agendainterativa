import React, { useEffect, useState, useRef } from 'react';
import { AgendaEvent, NotificationConfig } from '../types';
import { sendNotification } from '../utils/evolution';
import { soundEffects } from '../utils/audio';
import { BellRing, Smartphone, Bot } from 'lucide-react';

interface NotificationCheckerProps {
  events: AgendaEvent[];
  config: NotificationConfig;
  onUpdateEvent: (event: AgendaEvent) => void;
}

export const NotificationChecker: React.FC<NotificationCheckerProps> = ({
  events,
  config,
  onUpdateEvent,
}) => {
  const [lastAlert, setLastAlert] = useState<{ title: string; time: string; channel: string } | null>(null);
  const checkedEventsRef = useRef<Set<string>>(new Set());

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      const currentTimestamp = now.getTime();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      for (const event of events) {
        if (event.completed || event.reminderSent) continue;
        if (checkedEventsRef.current.has(event.id)) continue;

        // Determine event datetime
        const timePart = event.time || '08:00';
        const eventDateStr = `${event.date}T${timePart}:00`;
        const eventDate = new Date(eventDateStr);
        if (isNaN(eventDate.getTime())) continue;

        // Reminder offset in milliseconds
        const offsetMinutes = parseInt(event.reminderTiming, 10) || 0;
        const reminderTimestamp = eventDate.getTime() - offsetMinutes * 60 * 1000;

        // É do dia de hoje e já passou da hora do lembrete (até 4 horas após o início do compromisso)
        const isPastReminder = currentTimestamp >= reminderTimestamp;
        const isWithinWindow = currentTimestamp <= eventDate.getTime() + 4 * 60 * 60 * 1000;
        const isToday = event.date === todayStr;

        if (isPastReminder && (isWithinWindow || isToday)) {
          // 1. Play sound
          if (config.soundEnabled) {
            soundEffects.playChime();
          }

          // 2. Browser native notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🔔 Lembrete: ${event.title}`, {
                body: `Oi ${config.wifeName || 'meu amor'}! Seu compromisso está chegando às ${event.time || ''}!`,
                icon: '/favicon.svg',
              });
            } catch {
              // ignore
            }
          }

          // 3. Send Notification via Evolution API (WhatsApp) and/or Telegram
          const channel = config.channel || 'evolution';
          let sentSuccessfully = false;

          if (config.autoSendEnabled) {
            try {
              const res = await sendNotification(event, config);
              sentSuccessfully = res.success;
              if (!res.success) {
                console.warn('Alerta automático WhatsApp/Telegram não pôde ser enviado:', res.message);
              }
            } catch (err) {
              console.error('Falha ao disparar alerta automático:', err);
            }
          }

          // Só marca como enviado e exibe toast de sucesso se o envio foi bem-sucedido
          // (ou se autoSendEnabled estiver desativado, apenas para alerta local na tela)
          if (sentSuccessfully || !config.autoSendEnabled) {
            checkedEventsRef.current.add(event.id);
            onUpdateEvent({ ...event, reminderSent: true });

            const channelLabel =
              channel === 'evolution'
                ? 'WhatsApp (Evolution API)'
                : channel === 'telegram'
                ? 'Telegram'
                : 'WhatsApp & Telegram';

            setLastAlert({
              title: event.title,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              channel: channelLabel,
            });
            setTimeout(() => setLastAlert(null), 8000);
          }
        }
      }
    };

    // Check every 25 seconds
    const interval = setInterval(checkReminders, 25000);
    // Run initial check
    checkReminders();

    // No celular: ao desbloquear a tela ou alternar para a aba, verifica imediatamente
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        checkReminders();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [events, config, onUpdateEvent]);

  if (!lastAlert) return null;

  const isWhatsApp = config.channel === 'evolution' || config.channel === 'both';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 max-w-sm ${
          isWhatsApp
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-sky-500 to-indigo-600'
        }`}
      >
        <div className="p-2 bg-white/20 rounded-xl">
          <BellRing className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="text-xs">
          <div className="font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
            {isWhatsApp ? <Smartphone className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            <span>Alerta Disparado!</span>
            <span>({lastAlert.time})</span>
          </div>
          <div className="font-semibold text-white truncate max-w-[200px]">{lastAlert.title}</div>
          <div className="text-white/80 text-[11px]">
            Lembrete enviado via {lastAlert.channel} para {config.wifeName || 'sua esposa'} 💕
          </div>
        </div>
      </div>
    </div>
  );
};
