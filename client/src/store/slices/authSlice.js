import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    authSuccess(state, action) {
      state.status = 'authenticated';
      state.user = action.payload.user;
    },
    authFailure(state, action) {
      state.status = 'unauthenticated';
      state.error = action.payload || null;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
    logout(state) {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
  },
});

export const { authStart, authSuccess, authFailure, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
