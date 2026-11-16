import React, { useState } from 'react';
import { ThemeId, NotificationConfig } from '../types';
import { THEMES } from '../utils/theme';
import {
  Calendar,
  BookOpen,
  Droplet,
  Heart,
  Cloud,
  Plus,
  Sparkles,
  Send,
  Smartphone,
  Bot,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'agenda' | 'estudos' | 'habitos' | 'amor';
  onTabChange: (tab: 'agenda' | 'estudos' | 'habitos' | 'amor') => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  config: NotificationConfig;
  loveNotesCount: number;
  onOpenSettings: () => void;
  onOpenDeployGuide: () => void;
  onOpenNewEvent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentTheme,
  onThemeChange,
  config,
  loveNotesCount: _loveNotesCount,
  onOpenSettings,
  onOpenDeployGuide,
  onOpenNewEvent,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeObj = THEMES[currentTheme];

  const themeList: { id: ThemeId; label: string; icon: string }[] = [
    { id: 'sakura', label: 'Sakura & Rosa Chic', icon: '🌸' },
    { id: 'lavanda', label: 'Lavanda & Serenidade', icon: '💜' },
    { id: 'cappuccino', label: 'Cappuccino & Vanilla', icon: '☕' },
    { id: 'mint', label: 'Menta & Eucalipto', icon: '🌿' },
    { id: 'velvet', label: 'Noite Aveludada (Escuro)', icon: '🌙' },
  ];

  const channel = config.channel || 'evolution';
  const isConfigured =
    channel === 'evolution'
      ? Boolean(config.evolutionApiUrl && config.whatsappNumber)
      : channel === 'telegram'
      ? Boolean(config.botToken && config.chatId)
      : Boolean((config.evolutionApiUrl && config.whatsappNumber) || (config.botToken && config.chatId));

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight">
                  Agenda de {config.wifeName || 'Meu Amor'}
                </span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                Alertas no WhatsApp (Evolution API) & Foco diário
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-gray-100/80 rounded-2xl">
            <button
              onClick={() => onTabChange('agenda')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'agenda'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Agenda</span>
            </button>

            <button
              onClick={() => onTabChange('estudos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'estudos'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Estudos & Foco</span>
            </button>

            <button
              onClick={() => onTabChange('habitos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'habitos'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Droplet className="w-4 h-4 text-cyan-500" />
              <span>Hábitos & Saúde</span>
            </button>

            <button
              onClick={() => onTabChange('amor')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'amor'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Mural do Amor</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Trocar Tema da Agenda"
              >
                <span>{themeObj.icon}</span>
                <span className="hidden lg:inline">{themeObj.name}</span>
              </button>

              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setThemeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 space-y-1 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Escolha o visual:
                    </div>
                    {themeList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                          currentTheme === t.id
                            ? 'bg-rose-50 text-rose-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cloudflare Guide button */}
            <button
              onClick={onOpenDeployGuide}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/70 text-orange-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Como publicar no Cloudflare Pages"
            >
              <Cloud className="w-4 h-4 text-orange-600" />
              <span className="hidden lg:inline">Cloudflare Pages</span>
            </button>

            {/* Notification Settings button */}
            <button
              onClick={onOpenSettings}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isConfigured
                  ? channel === 'evolution'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : channel === 'telegram'
                    ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse'
              }`}
              title="Configurações de Alertas (Evolution API / Telegram)"
            >
              {channel === 'evolution' ? (
                <Smartphone className="w-4 h-4 text-emerald-600" />
              ) : channel === 'telegram' ? (
                <Bot className="w-4 h-4 text-sky-600" />
              ) : (
                <Send className="w-4 h-4 text-indigo-600" />
              )}
              <span className="hidden sm:inline">
                {channel === 'evolution'
                  ? 'WhatsApp'
                  : channel === 'telegram'
                  ? 'Telegram'
                  : 'WhatsApp & TG'}
              </span>
            </button>

            {/* Add Event Primary CTA */}
            <button
              onClick={onOpenNewEvent}
              className="px-3 sm:px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Compromisso</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-gray-100">
          <button
            onClick={() => onTabChange('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              activeTab === 'agenda' ? 'bg-rose-50 text-rose-600' : 'text-gray-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Agenda
          </button>
          <button
            onClick={() => onTabChange('estudos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              activeTab === 'estudos' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Estudos
          </button>
          <button
            onClick={() => onTabChange('habitos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              activeTab === 'habitos' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-500'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            Hábitos
          </button>
          <button
            onClick={() => onTabChange('amor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              activeTab === 'amor' ? 'bg-rose-50 text-rose-600' : 'text-gray-500'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Recados
          </button>
        </div>
      </div>
    </header>
  );
};
