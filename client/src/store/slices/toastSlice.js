import { createSlice, nanoid } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ title, description, tone = 'default', duration = 3500 }) {
        return { payload: { id: nanoid(), title, description, tone, duration } };
      },
    },
    removeToast(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;

export const toast = {
  success: (title, description) => pushToast({ title, description, tone: 'success' }),
  error: (title, description) => pushToast({ title, description, tone: 'destructive' }),
  info: (title, description) => pushToast({ title, description, tone: 'info' }),
  message: (title, description) => pushToast({ title, description, tone: 'default' }),
};
