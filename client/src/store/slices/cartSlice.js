import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { data: null, loading: false },
  reducers: {
    setCart(state, action) {
      state.data = action.payload;
    },
    setCartLoading(state, action) {
      state.loading = !!action.payload;
    },
  },
});

export const { setCart, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
