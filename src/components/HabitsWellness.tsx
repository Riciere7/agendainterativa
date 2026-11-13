import React from 'react';
import { HabitTracker, TelegramConfig } from '../types';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Droplet, Heart, Smile, Sparkles } from 'lucide-react';

interface HabitsWellnessProps {
  habit: HabitTracker;
  config: TelegramConfig;
  onUpdateHabit: (habit: HabitTracker) => void;
}

export const HabitsWellness: React.FC<HabitsWellnessProps> = ({
  habit,
  config,
  onUpdateHabit,
}) => {
  const targetGlasses = 8;

  const handleWaterClick = (index: number) => {
    soundEffects.playWaterDrop();
    const newCount = index + 1 === habit.waterGlasses ? index : index + 1;
    const updated = { ...habit, waterGlasses: newCount };
    onUpdateHabit(updated);

    if (newCount === targetGlasses) {
      if (config.soundEnabled) soundEffects.playSuccess();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#60a5fa'],
      });
    }
  };

  const moods: {
    id: 'radiante' | 'focada' | 'tranquila' | 'cansada' | 'sobrecarregada';
    label: string;
    emoji: string;
    husbandQuote: string;
  }[] = [
    {
      id: 'radiante',
      label: 'Radiante',
      emoji: '✨',
      husbandQuote: 'Amo te ver com essa energia contagiante! Seu sorriso ilumina o mundo inteiro! 💖',
    },
    {
      id: 'focada',
      label: 'Focada',
      emoji: '🎯',
      husbandQuote: 'Ninguém segura você quando está focada! Seus sonhos estão cada vez mais perto! 🚀',
    },
    {
      id: 'tranquila',
      label: 'Tranquila',
      emoji: '🌿',
      husbandQuote: 'Paz no coração é a melhor sensação. Aproveite cada minuto do seu dia com serenidade. 🍃',
    },
    {
      id: 'cansada',
      label: 'Cansada',
      emoji: '🥱',
      husbandQuote: 'Você já se esforçou muito! Lembre-se de descansar, tomar um banho quentinho e relaxar. Cuidarei de você! ☕',
    },
    {
      id: 'sobrecarregada',
      label: 'Sobrecarregada',
      emoji: '🫂',
      husbandQuote: 'Respira fundo e solte os ombros. Você não precisa carregar tudo sozinha, estou sempre com você pro que der e vier! ❤️',
    },
  ];

  const currentMoodObj = moods.find((m) => m.id === habit.mood);

  const handleMoodSelect = (moodId: 'radiante' | 'focada' | 'tranquila' | 'cansada' | 'sobrecarregada') => {
    onUpdateHabit({ ...habit, mood: moodId });
    if (config.soundEnabled) soundEffects.playChime();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Water Tracker */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Droplet className="w-5 h-5 fill-cyan-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Meta de Hidratação</h3>
                <p className="text-xs text-gray-500">2 Litros de água por dia (8 copos de 250ml)</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg">
              {habit.waterGlasses * 250}ml / 2000ml
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-5">
            Clique nos copinhos para registrar cada copo de água bebido hoje:
          </p>

          {/* 8 Water Glasses */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Array.from({ length: targetGlasses }).map((_, idx) => {
              const isFilled = idx < habit.waterGlasses;
              return (
                <button
                  key={idx}
                  onClick={() => handleWaterClick(idx)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    isFilled
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-600 shadow-sm scale-105'
                      : 'bg-gray-50/70 border-gray-100 text-gray-300 hover:border-cyan-200 hover:text-cyan-400'
                  }`}
                  title={`Copo ${idx + 1} (250ml)`}
                >
                  <Droplet
                    className={`w-7 h-7 transition-all ${
                      isFilled ? 'fill-cyan-500 text-cyan-500' : 'text-gray-300 group-hover:scale-110'
                    }`}
                  />
                  <span className="text-[11px] font-bold mt-1">
                    {isFilled ? '250ml' : `${idx + 1}º`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-cyan-50/50 rounded-2xl text-xs text-cyan-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>
            {habit.waterGlasses >= targetGlasses
              ? '🎉 Parabéns, meu bem! Meta de hidratação de hoje alcançada!'
              : `Faltam apenas ${targetGlasses - habit.waterGlasses} copo${
                  targetGlasses - habit.waterGlasses === 1 ? '' : 's'
                } para bater a meta!`}
          </span>
        </div>
      </div>

      {/* Mood & Energy Tracker */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Como você está se sentindo hoje?</h3>
                <p className="text-xs text-gray-500">Seu humor e bem-estar importam muito</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4">
            Escolha seu sentimento do momento para receber um recadinho especial:
          </p>

          {/* Mood Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {moods.map((m) => {
              const isSelected = habit.mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m.id)}
                  className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm scale-102 font-bold'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Personalized response from husband based on mood */}
        {currentMoodObj ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Recado do seu Amor:</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 font-medium italic leading-relaxed">
              "{currentMoodObj.husbandQuote}"
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center">
            Selecione uma opção acima para ver seu recadinho do dia. 💕
          </div>
        )}
      </div>
    </div>
  );
};
