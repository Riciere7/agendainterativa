import { ThemeId } from '../types';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  icon: string;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  badgeBg: string;
  accentColor: string;
  headerGrad: string;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  sakura: {
    id: 'sakura',
    name: 'Sakura & Rosa Chic',
    icon: '🌸',
    bgGradient: 'bg-gradient-to-br from-rose-50 via-[#FAF6F6] to-pink-50/50',
    cardBg: 'bg-white/90 backdrop-blur-sm',
    cardBorder: 'border-rose-100',
    primaryBg: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-600',
    primaryText: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#f43f5e',
    headerGrad: 'from-rose-500 via-pink-500 to-rose-400',
  },
  lavanda: {
    id: 'lavanda',
    name: 'Lavanda & Serenidade',
    icon: '💜',
    bgGradient: 'bg-gradient-to-br from-violet-50 via-[#FAF7FD] to-purple-50/50',
    cardBg: 'bg-white/90 backdrop-blur-sm',
    cardBorder: 'border-purple-100',
    primaryBg: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryText: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333ea',
    headerGrad: 'from-purple-600 via-violet-500 to-indigo-500',
  },
  cappuccino: {
    id: 'cappuccino',
    name: 'Cappuccino & Vanilla',
    icon: '☕',
    bgGradient: 'bg-gradient-to-br from-amber-50 via-[#FAF8F5] to-orange-50/40',
    cardBg: 'bg-white/90 backdrop-blur-sm',
    cardBorder: 'border-amber-100',
    primaryBg: 'bg-amber-700',
    primaryHover: 'hover:bg-amber-800',
    primaryText: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    accentColor: '#b45309',
    headerGrad: 'from-amber-700 via-amber-600 to-stone-600',
  },
  mint: {
    id: 'mint',
    name: 'Menta & Eucalipto',
    icon: '🌿',
    bgGradient: 'bg-gradient-to-br from-emerald-50 via-[#F7FCF9] to-teal-50/50',
    cardBg: 'bg-white/90 backdrop-blur-sm',
    cardBorder: 'border-emerald-100',
    primaryBg: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentColor: '#059669',
    headerGrad: 'from-emerald-600 via-teal-500 to-green-600',
  },
  velvet: {
    id: 'velvet',
    name: 'Noite Aveludada (Escuro)',
    icon: '🌙',
    bgGradient: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-slate-100',
    cardBg: 'bg-zinc-800/80 backdrop-blur-sm text-slate-100',
    cardBorder: 'border-zinc-700',
    primaryBg: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-600',
    primaryText: 'text-rose-400',
    badgeBg: 'bg-zinc-700 text-rose-300 border-zinc-600',
    accentColor: '#fb7185',
    headerGrad: 'from-rose-500 via-purple-600 to-indigo-600',
  },
};
