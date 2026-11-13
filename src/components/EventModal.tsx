import React, { useState, useEffect } from 'react';
import { AgendaEvent, EventCategory, EventPriority, ReminderTiming, TelegramConfig } from '../types';
import { formatEventTelegramHtml } from '../utils/telegram';
import { X, Sparkles, Clock, Calendar, MapPin, AlignLeft, BellRing, Eye, Check } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  eventToEdit?: AgendaEvent | null;
  defaultDate?: string;
  config: TelegramConfig;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventToEdit,
  defaultDate,
  config,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('estudos');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [priority, setPriority] = useState<EventPriority>('media');
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>('15');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setCategory(eventToEdit.category);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time || '09:00');
      setEndTime(eventToEdit.endTime || '');
      setLocationOrLink(eventToEdit.locationOrLink || '');
      setPriority(eventToEdit.priority);
      setReminderTiming(eventToEdit.reminderTiming);
    } else {
      setTitle('');
      setDescription('');
      setCategory('estudos');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setEndTime('10:00');
      setLocationOrLink('');
      setPriority('media');
      setReminderTiming('15');
    }
  }, [eventToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const currentMockEvent: AgendaEvent = {
    id: eventToEdit ? eventToEdit.id : 'temp',
    title: title || 'Título do Compromisso',
    description,
    category,
    date: date || new Date().toISOString().split('T')[0],
    time,
    endTime,
    locationOrLink,
    priority,
    reminderTiming,
    completed: false,
    createdAt: Date.now(),
  };

  const previewHtml = formatEventTelegramHtml(currentMockEvent, config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const eventData: AgendaEvent = {
      id: eventToEdit ? eventToEdit.id : `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      date,
      time: time || undefined,
      endTime: endTime || undefined,
      locationOrLink: locationOrLink.trim() || undefined,
      priority,
      reminderTiming,
      completed: eventToEdit ? eventToEdit.completed : false,
      createdAt: eventToEdit ? eventToEdit.createdAt : Date.now(),
    };

    onSave(eventData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {eventToEdit ? 'Editar Compromisso' : 'Novo Compromisso'}
              </h3>
              <p className="text-xs text-gray-500">
                Com alerta automático no Telegram para ela não esquecer
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Título do Compromisso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Aula de Direito / Reunião com Cliente / Treino"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'estudos', label: 'Estudos', icon: '📚' },
                { id: 'trabalho', label: 'Trabalho', icon: '💼' },
                { id: 'saude', label: 'Autocuidado', icon: '💅' },
                { id: 'amor', label: 'Momento a Dois', icon: '💑' },
                { id: 'rotina', label: 'Rotina / Tarefas', icon: '🎯' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as EventCategory)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Início
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Término (opcional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Reminder Timing & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5 text-rose-500" />
                Alertar no Telegram
              </label>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(e.target.value as ReminderTiming)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              >
                <option value="0">No horário exato do início</option>
                <option value="15">15 minutos antes</option>
                <option value="30">30 minutos antes</option>
                <option value="60">1 hora antes</option>
                <option value="1440">1 dia antes (24h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Prioridade
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'baixa', label: 'Baixa', color: 'text-gray-600' },
                  { id: 'media', label: 'Média', color: 'text-amber-600' },
                  { id: 'alta', label: 'Alta', color: 'text-red-600' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as EventPriority)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      priority === p.id
                        ? 'border-gray-800 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location or Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Local / Link (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Google Meet, Zoom, Biblioteca, Sala 102, Clínica..."
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
              Descrição & Anotações
            </label>
            <textarea
              rows={2}
              placeholder="Anotações importantes sobre este compromisso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Telegram Preview Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {showPreview ? 'Ocultar prévia do Telegram' : 'Ver como a mensagem chegará no Telegram dela'}
              </span>
            </button>

            {showPreview && (
              <div
                className="mt-3 p-4 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs text-gray-800 font-sans whitespace-pre-wrap leading-relaxed shadow-inner"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          {/* Form Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{eventToEdit ? 'Salvar Alterações' : 'Criar Compromisso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
