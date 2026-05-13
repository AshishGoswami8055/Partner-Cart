import { createSlice } from '@reduxjs/toolkit';

const stored = typeof window !== 'undefined' ? localStorage.getItem('pc-theme') : null;
const initial = stored || (
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem('pc-theme', state.mode);
    },
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pc-theme', state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
