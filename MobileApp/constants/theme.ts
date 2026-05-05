// ShelfSense Design System
export const Colors = {
  // Backgrounds
  bg: '#0F0D15',
  bgCard: '#1A1625',
  bgCardHover: '#252136',
  bgElevated: '#2D2640',
  bgInput: '#1E1933',

  // Borders
  border: '#332E45',
  borderFocus: '#7C3AED',

  // Primary
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',

  // Text
  text: '#F5F3FF',
  textSecondary: '#A8A0BF',
  textMuted: '#6B6280',
  textInverse: '#0F0D15',

  // Status
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.12)',
  critical: '#EF4444',
  criticalBg: 'rgba(239,68,68,0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.12)',

  // Gradients
  gradientPrimary: ['#7C3AED', '#5B21B6'] as const,
  gradientCard: ['#1E1933', '#1A1625'] as const,
  gradientAccent: ['#A78BFA', '#7C3AED', '#5B21B6'] as const,

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
};
