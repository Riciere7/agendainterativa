import React, { useState, useEffect } from 'react';
import { NotificationConfig, AgendaEvent, HabitTracker, ThemeId } from '../types';
import { getDailyQuote } from '../utils/quotes';
import { THEMES } from '../utils/theme';
import {
  Heart,
  Sparkles,
  Calendar,
  CheckCircle2,
  Droplet,
  MessageCircleHeart,
  Smartphone,
  Bot,
  Send,
  QrCode,
} from 'lucide-react';
import { checkEvolutionConnection } from '../utils/evolution';

interface HeaderHeroProps {
  config: NotificationConfig;
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
  const [evolutionConnected, setEvolutionConnected] = useState<boolean | null>(null);

  const hour = new Date().getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
  else if (hour >= 18 || hour < 5) greeting = 'Boa noite';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === todayStr);
  const completedToday = todayEvents.filter((e) => e.completed).length;

  const channel = config.channel || 'evolution';

  useEffect(() => {
    let isMounted = true;
    const verifyStatus = async () => {
      try {
        const res = await checkEvolutionConnection(config);
        if (isMounted) setEvolutionConnected(res.isOpen || false);
      } catch {
        if (isMounted) setEvolutionConnected(false);
      }
    };
    verifyStatus();
    const interval = setInterval(verifyStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.evolutionApiUrl, config.evolutionInstanceName, config.evolutionApiKey]);

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
              Seu cantinho especial para organizar estudos, trabalho e momentos que importam. Lembretes automáticos e carinhosos enviados via WhatsApp para você brilhar sem estresse!
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
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>Dose Diária de Amor</span>
                </div>
                <button
                  onClick={() => setQuoteOffset((prev) => prev + 1)}
                  className="text-xs text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Ver outra frase"
                >
                  Trocar frase ↻
                </button>
              </div>

              <p className="text-sm sm:text-base font-medium italic text-gray-700 leading-relaxed mb-3">
                "{dailyQuote.quote}"
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span className="font-semibold">{dailyQuote.authorNote}</span>

                <button
                  onClick={onOpenLoveNotes}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <MessageCircleHeart className="w-3.5 h-3.5" />
                  <span>Mural de Recados</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Alert Status Pill */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                evolutionConnected
                  ? 'bg-emerald-300 animate-ping'
                  : 'bg-rose-400'
              }`}
            />
            <span className="flex items-center gap-1.5 font-medium">
              {evolutionConnected ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                  <span>
                    WhatsApp Conectado (Instância: <strong>{config.evolutionInstanceName || 'AGENDAINTERATIVA'}</strong>) 🟢 • Alertas automáticos ativos
                  </span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5 text-rose-200" />
                  <span>
                    WhatsApp Desconectado 🔴 • Escaneie o QR Code para ativar o envio automático
                  </span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="underline hover:text-white cursor-pointer transition-colors font-bold"
          >
            {evolutionConnected ? 'Gerenciar WhatsApp & Alertas' : 'Escanear QR Code agora →'}
          </button>
        </div>
      </div>
    </div>
  );
};
