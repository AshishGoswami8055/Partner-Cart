import { useTheme } from '@/hooks/useTheme';

export const ThemeBootstrap = ({ children }) => {
  useTheme();
  return children;
};
