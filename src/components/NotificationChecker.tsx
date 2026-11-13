import React, { useEffect, useState, useRef } from 'react';
import { AgendaEvent, WhatsAppConfig } from '../types';
import { sendWhatsAppNotification, formatEventWhatsAppMessage } from '../utils/whatsapp';
import { soundEffects } from '../utils/audio';
import { BellRing, CheckCircle, AlertTriangle, Send } from 'lucide-react';

interface NotificationCheckerProps {
  events: AgendaEvent[];
  config: WhatsAppConfig;
  onUpdateEvent: (event: AgendaEvent) => void;
}

export const NotificationChecker: React.FC<NotificationCheckerProps> = ({
  events,
  config,
  onUpdateEvent,
}) => {
  const [lastAlert, setLastAlert] = useState<{ title: string; time: string } | null>(null);
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

        // If current time is within reminder window (between reminderTimestamp and event start + 30 min)
        if (currentTimestamp >= reminderTimestamp && currentTimestamp <= eventDate.getTime() + 30 * 60 * 1000) {
          checkedEventsRef.current.add(event.id);

          // 1. Play sound
          if (config.soundEnabled) {
            soundEffects.playChime();
          }

          // 2. Browser native notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🔔 Lembrete: ${event.title}`, {
                body: `Oi ${config.wifeName || 'meu amor'}! Seu compromisso está chegando às ${event.time || ''}!`,
                icon: '/favicon.ico',
              });
            } catch {
              // ignore
            }
          }

          // 3. Send WhatsApp Notification
          if (config.autoSendEnabled && config.wifePhone) {
            try {
              await sendWhatsAppNotification(event, config);
            } catch (err) {
              console.error('Falha ao disparar alerta WhatsApp automático:', err);
            }
          }

          // 4. In-App Toast
          setLastAlert({
            title: event.title,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          });
          setTimeout(() => setLastAlert(null), 8000);

          // 5. Mark event as reminderSent
          onUpdateEvent({ ...event, reminderSent: true });
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    // Run initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [events, config, onUpdateEvent]);

  if (!lastAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 max-w-sm">
        <div className="p-2 bg-white/20 rounded-xl">
          <BellRing className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="text-xs">
          <div className="font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1">
            <span>Alerta Disparado!</span>
            <span>({lastAlert.time})</span>
          </div>
          <div className="font-semibold text-white truncate max-w-[200px]">{lastAlert.title}</div>
          <div className="text-rose-100/90 text-[11px]">
            Lembrete enviado para o WhatsApp de {config.wifeName || 'sua esposa'} 💕
          </div>
        </div>
      </div>
    </div>
  );
};
