import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: typeof colors.light;
  spacing: typeof spacing;
  typography: typeof typography;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: colors.light,
  spacing,
  typography,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: colors.dark,
  spacing,
  typography,
};