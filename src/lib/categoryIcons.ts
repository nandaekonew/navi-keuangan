import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Wifi,
  GraduationCap,
  HeartPulse,
  Baby,
  Sparkles,
  Coffee,
  Shirt,
  Dumbbell,
  Plane,
  Gift,
  Coins,
  PiggyBank,
  Briefcase,
  Smartphone,
  Zap,
  Shield,
  Wrench,
  User,
  Tag,
} from 'lucide-react';

export interface CategoryIconOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { id: 'Utensils', label: 'Makan', icon: Utensils },
  { id: 'ShoppingBag', label: 'Belanja', icon: ShoppingBag },
  { id: 'Home', label: 'Rumah', icon: Home },
  { id: 'Car', label: 'Transport', icon: Car },
  { id: 'Wifi', label: 'Tagihan', icon: Wifi },
  { id: 'GraduationCap', label: 'Pendidikan', icon: GraduationCap },
  { id: 'HeartPulse', label: 'Kesehatan', icon: HeartPulse },
  { id: 'Baby', label: 'Anak', icon: Baby },
  { id: 'Sparkles', label: 'Hiburan', icon: Sparkles },
  { id: 'Coffee', label: 'Nongkrong', icon: Coffee },
  { id: 'Shirt', label: 'Pakaian', icon: Shirt },
  { id: 'Dumbbell', label: 'Olahraga', icon: Dumbbell },
  { id: 'Plane', label: 'Liburan', icon: Plane },
  { id: 'Gift', label: 'Kado/Amal', icon: Gift },
  { id: 'Coins', label: 'Tabungan', icon: Coins },
  { id: 'PiggyBank', label: 'Investasi', icon: PiggyBank },
  { id: 'Briefcase', label: 'Gaji/Kerja', icon: Briefcase },
  { id: 'Smartphone', label: 'Pulsa', icon: Smartphone },
  { id: 'Zap', label: 'Utilitas', icon: Zap },
  { id: 'Shield', label: 'Asuransi', icon: Shield },
  { id: 'Wrench', label: 'Servis', icon: Wrench },
  { id: 'User', label: 'Pribadi', icon: User },
  { id: 'Tag', label: 'Lainnya', icon: Tag },
];

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Wifi,
  GraduationCap,
  HeartPulse,
  Baby,
  Sparkles,
  Coffee,
  Shirt,
  Dumbbell,
  Plane,
  Gift,
  Coins,
  PiggyBank,
  Briefcase,
  Smartphone,
  Zap,
  Shield,
  Wrench,
  User,
  Tag,
};

export const CATEGORY_COLORS = [
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Amber
  '#64748b', // Slate
  '#14b8a6', // Teal
];
