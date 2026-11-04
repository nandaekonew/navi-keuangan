import React from 'react';
import {
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Store,
  Car,
  Fuel,
  Home,
  Wifi,
  GraduationCap,
  BookOpen,
  HeartPulse,
  Stethoscope,
  Baby,
  Sparkles,
  Heart,
  HandHeart,
  Coffee,
  Shirt,
  Dumbbell,
  Plane,
  Gift,
  Coins,
  PiggyBank,
  Briefcase,
  Smartphone,
  Package,
  Zap,
  Shield,
  Wrench,
  User,
  Smile,
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
  { id: 'ShoppingCart', label: 'Troli/Shopee', icon: ShoppingCart },
  { id: 'Store', label: 'Toko/Marketplace', icon: Store },
  { id: 'Home', label: 'Rumah', icon: Home },
  { id: 'Car', label: 'Transport', icon: Car },
  { id: 'Fuel', label: 'BBM/Bensin', icon: Fuel },
  { id: 'Wifi', label: 'Tagihan/Internet', icon: Wifi },
  { id: 'GraduationCap', label: 'Pendidikan', icon: GraduationCap },
  { id: 'BookOpen', label: 'Buku', icon: BookOpen },
  { id: 'HeartPulse', label: 'Kesehatan/Obat', icon: HeartPulse },
  { id: 'Stethoscope', label: 'Dokter', icon: Stethoscope },
  { id: 'HandHeart', label: 'Sedekah/Zakat', icon: HandHeart },
  { id: 'Heart', label: 'Istri/Kasih', icon: Heart },
  { id: 'User', label: 'Suami/Pribadi', icon: User },
  { id: 'Baby', label: 'Anak', icon: Baby },
  { id: 'Coffee', label: 'Nongkrong', icon: Coffee },
  { id: 'Shirt', label: 'Pakaian', icon: Shirt },
  { id: 'Dumbbell', label: 'Olahraga', icon: Dumbbell },
  { id: 'Plane', label: 'Liburan', icon: Plane },
  { id: 'Gift', label: 'Kado/Hadiah', icon: Gift },
  { id: 'Coins', label: 'Tabungan', icon: Coins },
  { id: 'PiggyBank', label: 'Investasi', icon: PiggyBank },
  { id: 'Briefcase', label: 'Gaji/Kerja', icon: Briefcase },
  { id: 'Smartphone', label: 'Pulsa/Data', icon: Smartphone },
  { id: 'Package', label: 'Paket/Kiriman', icon: Package },
  { id: 'Zap', label: 'Listrik/Utilitas', icon: Zap },
  { id: 'Shield', label: 'Asuransi', icon: Shield },
  { id: 'Wrench', label: 'Servis', icon: Wrench },
  { id: 'Sparkles', label: 'Hiburan', icon: Sparkles },
  { id: 'Tag', label: 'Lainnya', icon: Tag },
];

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Store,
  Home,
  Car,
  Fuel,
  Wifi,
  GraduationCap,
  BookOpen,
  HeartPulse,
  Stethoscope,
  HandHeart,
  Heart,
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
  Package,
  Zap,
  Shield,
  Wrench,
  User,
  Smile,
  Tag,
};

/**
 * Smart resolver to guarantee precise symbols for categories
 * even if stored icon string was fallback or missing.
 */
export function resolveCategoryIcon(
  iconName?: string | null,
  categoryName?: string
): React.ComponentType<{ className?: string }> {
  const normName = (categoryName || '').toLowerCase().trim();

  // Smart domain precision matching based on category name
  if (normName.includes('sedekah') || normName.includes('zakat') || normName.includes('infaq') || normName.includes('amal')) {
    return HandHeart;
  }
  if (normName.includes('shopee')) {
    return ShoppingCart;
  }
  if (normName.includes('tokopedia') || normName.includes('tiktok') || normName.includes('lazada') || normName.includes('blibli')) {
    return Store;
  }
  if (normName.includes('istri')) {
    return Heart;
  }
  if (normName.includes('suami')) {
    return User;
  }
  if (normName.includes('kesehatan') || normName.includes('obat') || normName.includes('medis')) {
    return HeartPulse;
  }
  if (normName.includes('bensin') || normName.includes('bbm') || normName.includes('pertamax')) {
    return Car;
  }
  if (normName.includes('rumah') || normName.includes('operasional')) {
    return Home;
  }
  if (normName.includes('tagihan') || normName.includes('internet') || normName.includes('wifi')) {
    return Wifi;
  }
  if (normName.includes('makan') || normName.includes('dapur') || normName.includes('kuliner')) {
    return Utensils;
  }
  if (normName.includes('anak') || normName.includes('pendidikan') || normName.includes('kursus')) {
    return GraduationCap;
  }

  // Use explicit icon if registered in map
  if (iconName && CATEGORY_ICON_MAP[iconName]) {
    return CATEGORY_ICON_MAP[iconName];
  }

  return Tag;
}

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
