import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, toggleTheme } from '@/store/slices/themeSlice';

export const useTheme = () => {
  const mode = useSelector((s) => s.theme.mode);
  const dispatch = useDispatch();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return {
    mode,
    setMode: (m) => dispatch(setTheme(m)),
    toggle: () => dispatch(toggleTheme()),
  };
};
