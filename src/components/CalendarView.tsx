import React, { useState } from 'react';
import { AgendaEvent, EventCategory } from '../types';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  events: AgendaEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onSelectDate,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate(today);
  };

  const categories: { id: string; label: string; icon: string; color: string }[] = [
    { id: 'todas', label: 'Todas', icon: '✨', color: 'bg-gray-100 text-gray-700' },
    { id: 'estudos', label: 'Estudos', icon: '📚', color: 'bg-blue-100 text-blue-700' },
    { id: 'trabalho', label: 'Trabalho', icon: '💼', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'saude', label: 'Autocuidado', icon: '💅', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'amor', label: 'A Dois', icon: '💑', color: 'bg-rose-100 text-rose-700' },
    { id: 'rotina', label: 'Rotina', icon: '🎯', color: 'bg-amber-100 text-amber-700' },
  ];

  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => {
      const matchDate = e.date === dayStr;
      const matchCat = selectedCategory === 'todas' || e.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDate && matchCat && matchSearch;
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm mb-6">
      {/* Month Navigation & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <p className="text-xs text-gray-500">Clique em qualquer dia para ver os compromissos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar compromisso..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-48 text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {/* Weekday headers */}
        {weekDays.map((d) => (
          <div key={d} className="text-xs font-bold text-gray-400 py-1 uppercase tracking-wider">
            {d}
          </div>
        ))}

        {/* Days */}
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);
          const dayEvents = getEventsForDay(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[58px] sm:min-h-[72px] p-1.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-[1.02]'
                  : isTodayDay
                  ? 'bg-rose-50/80 text-rose-700 font-bold border border-rose-200'
                  : isCurrentMonth
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-100'
                  : 'bg-gray-50/40 text-gray-300 border border-transparent'
              }`}
            >
              {/* Day Number */}
              <div className="w-full flex items-center justify-between text-xs">
                <span className={`font-semibold ${isSelected ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
                {isTodayDay && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>

              {/* Event Dots / Badge */}
              <div className="w-full flex items-center justify-center gap-1 mt-1 flex-wrap">
                {dayEvents.slice(0, 3).map((ev) => {
                  let dotColor = 'bg-blue-400';
                  if (ev.category === 'trabalho') dotColor = 'bg-indigo-400';
                  else if (ev.category === 'saude') dotColor = 'bg-emerald-400';
                  else if (ev.category === 'amor') dotColor = 'bg-rose-400';
                  else if (ev.category === 'rotina') dotColor = 'bg-amber-400';

                  if (isSelected) dotColor = 'bg-white';

                  return (
                    <span
                      key={ev.id}
                      className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                      title={ev.title}
                    />
                  );
                })}
                {dayEvents.length > 3 && (
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
