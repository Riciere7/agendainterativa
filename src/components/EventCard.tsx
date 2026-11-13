import React, { useState } from 'react';
import { AgendaEvent, TelegramConfig } from '../types';
import { getCategoryEmoji, getCategoryLabel, sendTelegramNotification } from '../utils/telegram';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Clock,
  MapPin,
  Send,
  CheckCircle,
  Circle,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  BellRing,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface EventCardProps {
  event: AgendaEvent;
  config: TelegramConfig;
  onToggleComplete: (id: string) => void;
  onEdit: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onEventUpdated: (event: AgendaEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  config,
  onToggleComplete,
  onEdit,
  onDelete,
  onEventUpdated,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const emoji = getCategoryEmoji(event.category);
  const categoryLabel = getCategoryLabel(event.category);

  // Category styling
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    estudos: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    trabalho: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    saude: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    amor: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    rotina: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };

  const colors = categoryColors[event.category] || categoryColors.rotina;

  const handleComplete = () => {
    if (!event.completed) {
      if (config.soundEnabled) soundEffects.playSuccess();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981'],
      });
    }
    onToggleComplete(event.id);
  };

  const handleSendTelegram = async () => {
    setIsSending(true);
    setStatusMessage(null);
    try {
      const res = await sendTelegramNotification(event, config);
      setStatusMessage(res.message);
      if (res.success) {
        onEventUpdated({ ...event, reminderSent: true });
      }
    } catch {
      setStatusMessage('Erro ao enviar alerta');
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const isLink =
    event.locationOrLink &&
    (event.locationOrLink.startsWith('http://') || event.locationOrLink.startsWith('https://'));

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border bg-white shadow-sm hover:shadow-md ${
        event.completed
          ? 'opacity-65 bg-gray-50/80 border-gray-200'
          : 'border-gray-100 hover:border-rose-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={handleComplete}
          className="mt-0.5 text-gray-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
          title={event.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
        >
          {event.completed ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span>{emoji}</span>
              <span>{categoryLabel}</span>
            </span>

            {event.priority === 'alta' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="w-3 h-3" />
                Alta Prioridade
              </span>
            )}

            {event.reminderTiming !== '0' && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1" title="Lembrete programado">
                <BellRing className="w-3 h-3 text-rose-400" />
                {event.reminderTiming === '1440' ? '1 dia antes' : `${event.reminderTiming}min antes`}
              </span>
            )}
          </div>

          <h3
            className={`text-base font-semibold text-gray-900 leading-snug break-words ${
              event.completed ? 'line-through text-gray-400' : ''
            }`}
          >
            {event.title}
          </h3>

          {event.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Time & Location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-gray-500">
            {event.time && (
              <div className="flex items-center gap-1 font-medium text-gray-700">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {event.time}
                  {event.endTime ? ` - ${event.endTime}` : ''}
                </span>
              </div>
            )}

            {event.locationOrLink && (
              <div className="flex items-center gap-1 truncate max-w-xs">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {isLink ? (
                  <a
                    href={event.locationOrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-0.5 truncate"
                  >
                    <span>Acessar link</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="truncate">{event.locationOrLink}</span>
                )}
              </div>
            )}
          </div>

          {/* Telegram Direct Action Bar */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleSendTelegram}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
              title="Disparar lembrete com carinho no Telegram dela"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Alertar no Telegram</span>
                </>
              )}
            </button>

            {statusMessage && (
              <span className="text-xs text-sky-600 font-medium animate-fade-in">
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Options Dropdown Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Mais opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(event);
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(event.id);
                  }}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
