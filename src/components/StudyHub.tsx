import React, { useState, useEffect } from 'react';
import { StudyExam } from '../types';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StudyHubProps {
  exams: StudyExam[];
  onSaveExams: (exams: StudyExam[]) => void;
}

export const StudyHub: React.FC<StudyHubProps> = ({ exams, onSaveExams }) => {
  // Pomodoro timer state
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // New Exam Form State
  const [showAddExam, setShowAddExam] = useState(false);
  const [examSubject, setExamSubject] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examWeight, setExamWeight] = useState('');

  // Pomodoro durations in seconds
  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      soundEffects.playPomodoroAlert();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (timerMode === 'focus') {
        setSessionsCompleted((prev) => prev + 1);
        setTimerMode('shortBreak');
        setTimeLeft(durations.shortBreak);
      } else {
        setTimerMode('focus');
        setTimeLeft(durations.focus);
      }
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode]);

  const switchMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(durations[mode]);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[timerMode]);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add Exam
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examDate) return;
    const newExam: StudyExam = {
      id: `exam-${Date.now()}`,
      subject: examSubject || 'Geral',
      title: examTitle,
      date: examDate,
      weightOrGrade: examWeight || undefined,
      completed: false,
    };
    onSaveExams([...exams, newExam]);
    setExamTitle('');
    setExamSubject('');
    setExamDate('');
    setExamWeight('');
    setShowAddExam(false);
  };

  const toggleExamComplete = (id: string) => {
    const updated = exams.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    onSaveExams(updated);
    soundEffects.playSuccess();
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter((ex) => ex.id !== id);
    onSaveExams(updated);
  };

  return (
    <div className="space-y-6">
      {/* Grid: Pomodoro on Left, Exams Countdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pomodoro Timer */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Pomodoro de Foco</h3>
                  <p className="text-xs text-gray-500">25 min foco total + 5 min pausa</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                {sessionsCompleted} ciclos hoje ✨
              </span>
            </div>

            {/* Mode Selector */}
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
              {[
                { id: 'focus', label: 'Foco (25m)' },
                { id: 'shortBreak', label: 'Pausa (5m)' },
                { id: 'longBreak', label: 'Descanso (15m)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id as 'focus' | 'shortBreak' | 'longBreak')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    timerMode === m.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Timer Clock Display */}
            <div className="py-6 text-center">
              <div className="text-6xl sm:text-7xl font-mono font-extrabold text-gray-900 tracking-tighter">
                {formatTimer(timeLeft)}
              </div>
              <p className="text-xs font-medium text-gray-400 mt-2">
                {timerMode === 'focus' ? 'Hora de estudar e brilhar! 📚' : 'Respire fundo, tome uma água! ☕'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-2xl font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Foco</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer"
              title="Reiniciar tempo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Provas & Entregas Countdown */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Provas, Concursos & Prazos Importantes</h3>
                <p className="text-xs text-gray-500">Contagem regressiva automática</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddExam(!showAddExam)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Prova</span>
            </button>
          </div>

          {/* Form to Add Exam */}
          {showAddExam && (
            <form onSubmit={handleAddExam} className="mb-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Matéria (Ex: Direito Administrativo)"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Título (Ex: Prova Final / Entrega TCC)"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Observação / Peso (opcional)"
                  value={examWeight}
                  onChange={(e) => setExamWeight(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExam(false)}
                  className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-1.5 bg-rose-500 text-white rounded-lg shadow-sm hover:bg-rose-600 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {/* Exams List */}
          {exams.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Nenhuma prova ou prazo cadastrado ainda. Clique em "Adicionar Prova"!
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((ex) => {
                let daysLeft = 0;
                try {
                  daysLeft = differenceInCalendarDays(parseISO(ex.date), new Date());
                } catch {
                  daysLeft = 0;
                }

                let daysBadge = '';
                let daysBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

                if (daysLeft < 0) {
                  daysBadge = 'Encerrada';
                  daysBadgeClass = 'bg-gray-100 text-gray-500 border-gray-200';
                } else if (daysLeft === 0) {
                  daysBadge = 'É HOJE! 🎯';
                  daysBadgeClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
                } else if (daysLeft === 1) {
                  daysBadge = 'É Amanhã!';
                  daysBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
                } else {
                  daysBadge = `Faltam ${daysLeft} dias`;
                  if (daysLeft <= 3) {
                    daysBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  }
                }

                let formattedDate = ex.date;
                try {
                  formattedDate = format(parseISO(ex.date), "dd 'de' MMMM", { locale: ptBR });
                } catch {
                  // fallback
                }

                return (
                  <div
                    key={ex.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      ex.completed
                        ? 'bg-gray-50/60 border-gray-100 opacity-60'
                        : 'bg-white border-gray-100 hover:border-rose-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleExamComplete(ex.id)}
                        className="text-gray-300 hover:text-emerald-500 cursor-pointer shrink-0"
                        title={ex.completed ? 'Marcar como não concluída' : 'Marcar como realizada'}
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${ex.completed ? 'text-emerald-500' : ''}`}
                        />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {ex.subject}
                          </span>
                          {ex.weightOrGrade && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {ex.weightOrGrade}
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-sm font-semibold text-gray-900 truncate ${
                            ex.completed ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {ex.title}
                        </h4>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${daysBadgeClass}`}
                      >
                        {daysBadge}
                      </span>
                      <button
                        onClick={() => deleteExam(ex.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        title="Excluir prova"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
