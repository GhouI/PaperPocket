import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  // Primary
  primary: '#137fec',
  primaryLight: 'rgba(19, 127, 236, 0.2)',
  primaryDark: 'rgba(19, 127, 236, 0.3)',
  
  // Accent
  accent: '#ff9500',
  accentLight: 'rgba(255, 149, 0, 0.2)',
  
  // Backgrounds
  backgroundLight: '#f6f7f8',
  backgroundDark: '#101922',
  
  // Cards
  cardLight: '#ffffff',
  cardDark: '#192633',
  cardDarkAlt: '#233648',
  
  // Text - Light mode
  textPrimaryLight: '#1C1C1E',
  textSecondaryLight: '#6b7280',
  textTertiaryLight: '#9ca3af',
  
  // Text - Dark mode
  textPrimaryDark: '#f3f4f6',
  textSecondaryDark: '#92adc9',
  textTertiaryDark: '#6b7280',
  
  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Misc
  border: 'rgba(255, 255, 255, 0.1)',
  dividerLight: '#e5e7eb',
  dividerDark: 'rgba(255, 255, 255, 0.1)',
  
  // Category colors
  purple: '#8b5cf6',
  teal: '#14b8a6',
  indigo: '#6366f1',
  sky: '#0ea5e9',
  yellow: '#eab308',
  red: '#ef4444',
  slate: '#64748b',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    bold: 'Inter_700Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const layout = {
  screenWidth: width,
  screenHeight: height,
  headerHeight: 56,
  tabBarHeight: 80,
  inputHeight: 48,
  buttonHeight: 48,
} as const;

// Theme-aware color getter
export const getThemeColors = (isDark: boolean) => ({
  background: isDark ? colors.backgroundDark : colors.backgroundLight,
  card: isDark ? colors.cardDark : colors.cardLight,
  cardAlt: isDark ? colors.cardDarkAlt : colors.cardLight,
  textPrimary: isDark ? colors.textPrimaryDark : colors.textPrimaryLight,
  textSecondary: isDark ? colors.textSecondaryDark : colors.textSecondaryLight,
  textTertiary: isDark ? colors.textTertiaryDark : colors.textTertiaryLight,
  divider: isDark ? colors.dividerDark : colors.dividerLight,
  primary: colors.primary,
  primaryLight: isDark ? colors.primaryDark : colors.primaryLight,
  accent: colors.accent,
  accentLight: colors.accentLight,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
});

export type ThemeColors = ReturnType<typeof getThemeColors>;

