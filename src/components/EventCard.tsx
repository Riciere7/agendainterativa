import React, { useState } from 'react';
import { AgendaEvent, NotificationConfig } from '../types';
import { getCategoryEmoji, getCategoryLabel } from '../utils/telegram';
import { sendNotification } from '../utils/evolution';
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
  Loader2,
  Smartphone,
  Bot,
} from 'lucide-react';

interface EventCardProps {
  event: AgendaEvent;
  config: NotificationConfig;
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

  const handleSendNotification = async () => {
    setIsSending(true);
    setStatusMessage(null);

    const activeChannel = config.channel || 'evolution';
    if ((activeChannel === 'evolution' || activeChannel === 'both') && !config.whatsappNumber?.trim()) {
      setStatusMessage('⚠️ Cadastre o número de WhatsApp nas configurações (topo da tela)!');
      setIsSending(false);
      setTimeout(() => setStatusMessage(null), 6000);
      return;
    }

    try {
      const res = await sendNotification(event, config);
      setStatusMessage(res.message);
      if (res.success) {
        onEventUpdated({ ...event, reminderSent: true });
      }
    } catch {
      setStatusMessage('Erro ao enviar alerta');
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const isLink =
    event.locationOrLink &&
    (event.locationOrLink.startsWith('http://') || event.locationOrLink.startsWith('https://'));

  const channel = config.channel || 'evolution';
  const isWhatsApp = channel === 'evolution' || channel === 'both';

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
          className="mt-1 text-gray-300 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
          title={event.completed ? 'Marcar como não concluído' : 'Marcar como concluído'}
        >
          {event.completed ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span>{emoji}</span>
              <span>{categoryLabel}</span>
            </span>

            {/* Priority Badge */}
            {event.priority === 'alta' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider">
                Prioridade Alta
              </span>
            )}

            {event.reminderSent && (
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" />
                Alertado
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`text-sm sm:text-base font-bold text-gray-900 leading-snug break-words ${
              event.completed ? 'line-through text-gray-400' : ''
            }`}
          >
            {event.title}
          </h4>

          {/* Description */}
          {event.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
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

          {/* Direct Action Bar */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                channel === 'evolution'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  : channel === 'telegram'
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title={
                channel === 'evolution'
                  ? 'Disparar lembrete no WhatsApp via Evolution API'
                  : channel === 'telegram'
                  ? 'Disparar lembrete no Telegram'
                  : 'Disparar lembrete no WhatsApp e Telegram'
              }
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  {channel === 'evolution' ? (
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  ) : channel === 'telegram' ? (
                    <Bot className="w-3.5 h-3.5 text-sky-600" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>
                    {channel === 'evolution'
                      ? 'Alertar no WhatsApp'
                      : channel === 'telegram'
                      ? 'Alertar no Telegram'
                      : 'Alertar WhatsApp & TG'}
                  </span>
                </>
              )}
            </button>

            {statusMessage && (
              <span
                className={`text-xs font-medium animate-fade-in ${
                  isWhatsApp ? 'text-emerald-700' : 'text-sky-700'
                }`}
              >
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
