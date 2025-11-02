import { useAppStore } from '../state/store';
import { darkTheme, lightTheme, Theme } from '../theme';

export const useTheme = (): Theme => {
  const mode = useAppStore((s) => s.mode);
  return mode === 'dark' ? darkTheme : lightTheme;
};