import React, { useState } from 'react';
import { AgendaEvent, NotificationConfig } from '../types';
import { EventCard } from './EventCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Send, Loader2, Smartphone, Bot } from 'lucide-react';
import { formatDailySummaryWhatsAppMessage, sendRawNotification } from '../utils/evolution';

interface DailyTimelineProps {
  date: Date;
  events: AgendaEvent[];
  config: NotificationConfig;
  onAddNewEvent: () => void;
  onToggleComplete: (id: string) => void;
  onEditEvent: (event: AgendaEvent) => void;
  onDeleteEvent: (id: string) => void;
  onEventUpdated: (event: AgendaEvent) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  date,
  events,
  config,
  onAddNewEvent,
  onToggleComplete,
  onEditEvent,
  onDeleteEvent,
  onEventUpdated,
}) => {
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  let formattedDateTitle = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  formattedDateTitle = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  const completedCount = dayEvents.filter((e) => e.completed).length;

  const channel = config.channel || 'evolution';

  // Build a summary message for the whole day to send
  const handleSendDailySummary = async () => {
    if (channel === 'evolution' && (!config.evolutionApiUrl || !config.whatsappNumber)) {
      alert('Configure a Evolution API e o número do WhatsApp nas configurações primeiro!');
      return;
    }

    if (channel === 'telegram' && (!config.botToken || !config.chatId)) {
      alert('Configure o Bot Token e o Chat ID nas configurações do Telegram primeiro!');
      return;
    }

    if (dayEvents.length === 0) return;

    setIsSendingSummary(true);
    setSummaryStatus(null);

    // WhatsApp formatted summary
    const whatsAppSummary = formatDailySummaryWhatsAppMessage(formattedDateTitle, dayEvents, config);

    // Telegram HTML formatted summary
    let telegramSummary = `🌟 <b>ROTEIRO DO DIA - ${formattedDateTitle.toUpperCase()}</b> 🌟\n\n`;
    telegramSummary += `Oi <b>${config.wifeName || 'meu amor'}</b>! Aqui está a sua programação de hoje:\n\n`;
    dayEvents.forEach((ev, i) => {
      const time = ev.time ? `[${ev.time}] ` : '';
      const check = ev.completed ? '✅' : '⏳';
      telegramSummary += `${i + 1}. ${check} ${time}<b>${ev.title}</b>\n`;
      if (ev.locationOrLink) telegramSummary += `   📍 <i>${ev.locationOrLink}</i>\n`;
    });
    telegramSummary += `\n💪 <i>Você é capaz de tudo! Qualquer coisa estou por aqui torcendo por você.</i>\n${
      config.husbandName ? `Com amor, <b>${config.husbandName}</b> ❤️` : 'Te amo! ❤️'
    }`;

    try {
      const res = await sendRawNotification(whatsAppSummary, telegramSummary, config);
      setSummaryStatus(res.success ? 'Roteiro enviado!' : res.message);
    } catch {
      setSummaryStatus('Erro ao enviar roteiro.');
    } finally {
      setIsSendingSummary(false);
      setTimeout(() => setSummaryStatus(null), 4000);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{formattedDateTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {dayEvents.length === 0
              ? 'Nenhum compromisso agendado'
              : `${dayEvents.length} compromisso${dayEvents.length === 1 ? '' : 's'} (${completedCount} concluído${completedCount === 1 ? '' : 's'})`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {dayEvents.length > 0 && (
            <button
              onClick={handleSendDailySummary}
              disabled={isSendingSummary}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                channel === 'evolution'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  : channel === 'telegram'
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title={
                channel === 'evolution'
                  ? 'Enviar roteiro completo do dia para o WhatsApp dela via Evolution API'
                  : channel === 'telegram'
                  ? 'Enviar roteiro completo do dia para o Telegram dela'
                  : 'Enviar roteiro completo para WhatsApp e Telegram'
              }
            >
              {isSendingSummary ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : channel === 'evolution' ? (
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              ) : channel === 'telegram' ? (
                <Bot className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <Send className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>
                {summaryStatus ||
                  (channel === 'evolution'
                    ? 'Enviar Roteiro WhatsApp'
                    : channel === 'telegram'
                    ? 'Enviar Roteiro Telegram'
                    : 'Enviar Roteiro Geral')}
              </span>
            </button>
          )}

          <button
            onClick={onAddNewEvent}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Events Timeline / List */}
      <div className="space-y-3">
        {dayEvents.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">Nenhum compromisso marcado para este dia.</p>
            <p className="text-xs mt-1">Aproveite para descansar ou planejar um novo momento especial!</p>
          </div>
        ) : (
          dayEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              config={config}
              onToggleComplete={onToggleComplete}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onEventUpdated={onEventUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};
