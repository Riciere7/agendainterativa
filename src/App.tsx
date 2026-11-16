import React, { useState, useEffect } from 'react';
import { AgendaEvent, HabitTracker, LoveNote, StudyExam, ThemeId, NotificationConfig } from './types';
import {
  loadEvents,
  saveEvents,
  loadNotificationConfig,
  saveNotificationConfig,
  loadTheme,
  saveTheme,
  loadLoveNotes,
  saveLoveNotes,
  loadHabitTracker,
  saveHabitTracker,
  loadExams,
  saveExams,
  getTodayDateString,
} from './utils/storage';
import { THEMES } from './utils/theme';
import { Navbar } from './components/Navbar';
import { HeaderHero } from './components/HeaderHero';
import { CalendarView } from './components/CalendarView';
import { DailyTimeline } from './components/DailyTimeline';
import { StudyHub } from './components/StudyHub';
import { HabitsWellness } from './components/HabitsWellness';
import { LoveNotesModal } from './components/LoveNotesModal';
import { EventModal } from './components/EventModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { CloudflareDeployGuideModal } from './components/CloudflareDeployGuideModal';
import { NotificationChecker } from './components/NotificationChecker';
import { Heart, Cloud, Sparkles, Plus, Send, Trash2, Smartphone, Bot } from 'lucide-react';
import { sendRawNotification, formatLoveNoteWhatsAppMessage } from './utils/evolution';

export function App() {
  const todayStr = getTodayDateString();

  // Persistent States
  const [events, setEvents] = useState<AgendaEvent[]>(() => loadEvents());
  const [config, setConfig] = useState<NotificationConfig>(() => loadNotificationConfig());
  const [theme, setTheme] = useState<ThemeId>(() => loadTheme());
  const [loveNotes, setLoveNotes] = useState<LoveNote[]>(() => loadLoveNotes());
  const [exams, setExams] = useState<StudyExam[]>(() => loadExams());
  const [habit, setHabit] = useState<HabitTracker>(() => loadHabitTracker(todayStr));

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'agenda' | 'estudos' | 'habitos' | 'amor'>('agenda');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeployGuideModalOpen, setIsDeployGuideModalOpen] = useState(false);
  const [isLoveNotesModalOpen, setIsLoveNotesModalOpen] = useState(false);
  const [toastNoteStatus, setToastNoteStatus] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveNotificationConfig(config);
  }, [config]);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveLoveNotes(loveNotes);
  }, [loveNotes]);

  useEffect(() => {
    saveExams(exams);
  }, [exams]);

  useEffect(() => {
    saveHabitTracker(habit);
  }, [habit]);

  // Event Handlers
  const handleSaveEvent = (savedEvent: AgendaEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });
  };

  const handleToggleComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este compromisso?')) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleEditEvent = (evt: AgendaEvent) => {
    setEventToEdit(evt);
    setIsEventModalOpen(true);
  };

  const handleOpenNewEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };

  const currentTheme = THEMES[theme];
  const channel = config.channel || 'evolution';

  return (
    <div className={`min-h-screen ${currentTheme.bgGradient} flex flex-col font-sans transition-colors duration-300`}>
      {/* Background Notification Daemon */}
      <NotificationChecker
        events={events}
        config={config}
        onUpdateEvent={(updated) => {
          setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        }}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTheme={theme}
        onThemeChange={setTheme}
        config={config}
        loveNotesCount={loveNotes.length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideModalOpen(true)}
        onOpenNewEvent={handleOpenNewEvent}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner */}
        <HeaderHero
          config={config}
          events={events}
          habit={habit}
          theme={theme}
          onOpenLoveNotes={() => setIsLoveNotesModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenWater={() => setActiveTab('habitos')}
        />

        {/* Tab 1: Agenda & Calendar */}
        {activeTab === 'agenda' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <CalendarView
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            <div className="lg:col-span-7">
              <DailyTimeline
                date={selectedDate}
                events={events}
                config={config}
                onAddNewEvent={handleOpenNewEvent}
                onToggleComplete={handleToggleComplete}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onEventUpdated={(upd) =>
                  setEvents((prev) => prev.map((e) => (e.id === upd.id ? upd : e)))
                }
              />
            </div>
          </div>
        )}

        {/* Tab 2: Estudos & Foco */}
        {activeTab === 'estudos' && (
          <StudyHub exams={exams} onSaveExams={setExams} />
        )}

        {/* Tab 3: Hábitos & Bem-Estar */}
        {activeTab === 'habitos' && (
          <HabitsWellness
            habit={habit}
            config={config}
            onUpdateHabit={setHabit}
          />
        )}

        {/* Tab 4: Mural do Amor */}
        {activeTab === 'amor' && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-500">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Mural do Amor & Motivação 💕
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Mensagens carinhosas para aquecer o coração e dar ânimo nos estudos e trabalho
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLoveNotesModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Bilhetinho</span>
              </button>
            </div>

            {toastNoteStatus && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center animate-fade-in">
                {toastNoteStatus}
              </div>
            )}

            {/* Sticky Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loveNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-3xl p-5 shadow-sm border border-black/5 relative flex flex-col justify-between transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: note.color }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => {
                            if (channel === 'evolution' && (!config.evolutionApiUrl || !config.whatsappNumber)) {
                              alert('Configure a Evolution API e o número de WhatsApp nas configurações!');
                              return;
                            }
                            if (channel === 'telegram' && (!config.botToken || !config.chatId)) {
                              alert('Configure o Telegram nas configurações!');
                              return;
                            }
                            const whatsAppMsg = formatLoveNoteWhatsAppMessage(note, config);
                            const telegramMsg = `💌 <b>BILHETINHO DE AMOR</b> 💌\n\n<i>"${note.text}"</i>\n\n— <b>${note.author}</b>`;
                            const res = await sendRawNotification(whatsAppMsg, telegramMsg, config);
                            setToastNoteStatus(
                              res.success
                                ? channel === 'evolution'
                                  ? 'Bilhete enviado para o WhatsApp dela!'
                                  : channel === 'telegram'
                                  ? 'Bilhete enviado para o Telegram dela!'
                                  : 'Bilhete enviado para WhatsApp e Telegram!'
                                : res.message
                            );
                            setTimeout(() => setToastNoteStatus(null), 3500);
                          }}
                          className={`p-1 rounded-lg cursor-pointer transition-colors ${
                            channel === 'evolution'
                              ? 'text-emerald-600 hover:text-emerald-800'
                              : 'text-sky-600 hover:text-sky-800'
                          }`}
                          title={
                            channel === 'evolution'
                              ? 'Enviar este recado no WhatsApp dela via Evolution API'
                              : 'Enviar este recado no Telegram dela'
                          }
                        >
                          {channel === 'evolution' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : channel === 'telegram' ? (
                            <Bot className="w-3.5 h-3.5" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setLoveNotes((prev) => prev.filter((n) => n.id !== note.id));
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed italic mb-4">
                      "{note.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-gray-700 font-bold">
                    <span>{note.author}</span>
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-100 bg-white/60 backdrop-blur-sm text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Desenvolvido com todo o amor para</span>
            <span className="text-rose-600 font-bold">{config.wifeName || 'minha esposa'}</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeployGuideModalOpen(true)}
              className="hover:text-orange-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 text-orange-500" />
              <span>Hospedado no Cloudflare Pages</span>
            </button>

            <span>•</span>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className={`hover:text-emerald-600 flex items-center gap-1 cursor-pointer transition-colors ${
                channel === 'evolution' ? 'text-emerald-600' : 'text-sky-600'
              }`}
            >
              {channel === 'evolution' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Evolution API (WhatsApp) Ativa</span>
                </>
              ) : channel === 'telegram' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-sky-500" />
                  <span>Telegram Bot Ativo</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>WhatsApp & Telegram Ativos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
        defaultDate={selectedDate ? selectedDate.toISOString().split('T')[0] : todayStr}
        config={config}
      />

      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={setConfig}
      />

      <CloudflareDeployGuideModal
        isOpen={isDeployGuideModalOpen}
        onClose={() => setIsDeployGuideModalOpen(false)}
      />

      <LoveNotesModal
        isOpen={isLoveNotesModalOpen}
        onClose={() => setIsLoveNotesModalOpen(false)}
        notes={loveNotes}
        config={config}
        onSaveNotes={setLoveNotes}
      />
    </div>
  );
}

export default App;
