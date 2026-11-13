import React from 'react';
import { AgendaEvent, WhatsAppConfig } from '../types';
import { EventCard } from './EventCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Sparkles, Send, CalendarCheck } from 'lucide-react';
import { getDirectWhatsAppUrl } from '../utils/whatsapp';

interface DailyTimelineProps {
  date: Date;
  events: AgendaEvent[];
  config: WhatsAppConfig;
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
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  let formattedDateTitle = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  formattedDateTitle = formattedDateTitle.charAt(0).toUpperCase() + formattedDateTitle.slice(1);

  const completedCount = dayEvents.filter((e) => e.completed).length;

  // Build a summary message for the whole day to send via WhatsApp
  const handleSendDailySummary = () => {
    if (!config.wifePhone) {
      alert('Configure o número de WhatsApp nas configurações primeiro!');
      return;
    }
    if (dayEvents.length === 0) return;

    let summary = `🌟 *RESUMO DO DIA - ${formattedDateTitle.toUpperCase()}* 🌟\n\n`;
    summary += `Oi ${config.wifeName || 'meu amor'}! Aqui está o seu roteiro de hoje:\n\n`;

    dayEvents.forEach((ev, i) => {
      const time = ev.time ? `[${ev.time}] ` : '';
      const check = ev.completed ? '✅' : '⏳';
      summary += `${i + 1}. ${check} ${time}*${ev.title}*\n`;
      if (ev.locationOrLink) summary += `   📍 ${ev.locationOrLink}\n`;
    });

    summary += `\n💪 *Você é capaz de tudo! Qualquer coisa estou por aqui.*\n${
      config.husbandName ? `Com amor, ${config.husbandName} ❤️` : 'Te amo! ❤️'
    }`;

    const url = getDirectWhatsAppUrl(config.wifePhone, summary);
    window.open(url, '_blank');
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
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Enviar roteiro completo do dia para o WhatsApp dela"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Roteiro WhatsApp</span>
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

      {/* Events List */}
      {dayEvents.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-400">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Dia livre ou sem compromissos!</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Aproveite para focar nos estudos, tirar um tempo para autocuidado ou planejar um momento a dois. 💕
          </p>
          <button
            onClick={onAddNewEvent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Compromisso
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              config={config}
              onToggleComplete={onToggleComplete}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onEventUpdated={onEventUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};
