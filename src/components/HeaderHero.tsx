import React, { useState } from 'react';
import { TelegramConfig, AgendaEvent, HabitTracker, ThemeId } from '../types';
import { getDailyQuote } from '../utils/quotes';
import { THEMES } from '../utils/theme';
import { Heart, Sparkles, Calendar, CheckCircle2, Droplet, MessageCircleHeart, Send } from 'lucide-react';

interface HeaderHeroProps {
  config: TelegramConfig;
  events: AgendaEvent[];
  habit: HabitTracker;
  theme: ThemeId;
  onOpenLoveNotes: () => void;
  onOpenSettings: () => void;
  onOpenWater: () => void;
}

export const HeaderHero: React.FC<HeaderHeroProps> = ({
  config,
  events,
  habit,
  theme,
  onOpenLoveNotes,
  onOpenSettings,
  onOpenWater,
}) => {
  const currentTheme = THEMES[theme];
  const [quoteOffset, setQuoteOffset] = useState(0);
  const dailyQuote = getDailyQuote(quoteOffset);

  const hour = new Date().getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
  else if (hour >= 18 || hour < 5) greeting = 'Boa noite';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === todayStr);
  const completedToday = todayEvents.filter((e) => e.completed).length;

  const isConfigured = Boolean(config.botToken && config.chatId);

  return (
    <div className="w-full mb-8">
      {/* Banner Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r ${currentTheme.headerGrad} text-white shadow-xl`}
      >
        {/* Decorative background glows */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Greeting & Summary */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Agenda Inteligente & Feita com Amor</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {greeting}, {config.wifeName || 'Meu Amor'}! 💕
            </h1>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl mb-5">
              Seu cantinho especial para organizar estudos, trabalho e momentos que importam. Lembretes automáticos e ilimitados direto no seu Telegram para você brilhar sem estresse!
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-white/90" />
                <span>
                  <strong>{todayEvents.length}</strong> compromisso{todayEvents.length === 1 ? '' : 's'} hoje
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>
                  <strong>{completedToday}</strong>/{todayEvents.length} concluído{completedToday === 1 ? '' : 's'}
                </span>
              </div>

              <button
                onClick={onOpenWater}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-xs sm:text-sm transition-colors cursor-pointer"
                title="Ver hidratação"
              >
                <Droplet className="w-4 h-4 text-cyan-200" />
                <span>
                  <strong>{habit.waterGlasses}</strong>/8 copos d'água
                </span>
              </button>
            </div>
          </div>

          {/* Right Daily Love / Inspiration Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 text-gray-800 rounded-2xl p-5 shadow-lg border border-white/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-500">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>Frase do Dia com Amor</span>
                </div>
                <button
                  onClick={() => setQuoteOffset((prev) => prev + 1)}
                  className="text-xs text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Ver outra mensagem inspiradora"
                >
                  Outra frase ✨
                </button>
              </div>

              <blockquote className="text-sm font-medium italic text-gray-700 leading-relaxed mb-3">
                "{dailyQuote.quote}"
              </blockquote>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  {dailyQuote.authorNote}
                </span>
                <button
                  onClick={onOpenLoveNotes}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 inline-flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  <MessageCircleHeart className="w-3.5 h-3.5" />
                  Recadinhos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Alert Status Pill */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-sky-300 animate-ping' : 'bg-amber-300'
              }`}
            />
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-200" />
              {isConfigured ? (
                <>
                  Telegram Bot conectado (Chat ID: <strong>{config.chatId}</strong>) • Lembretes automáticos e gratuitos
                </>
              ) : (
                <>Telegram Bot ainda não configurado. Ative em 30 segundos!</>
              )}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="underline hover:text-white cursor-pointer transition-colors"
          >
            {isConfigured ? 'Alterar configurações do Telegram' : 'Configurar Telegram agora →'}
          </button>
        </div>
      </div>
    </div>
  );
};
