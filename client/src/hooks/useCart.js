import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { cartApi } from '@/api/endpoints';
import { setCart, setCartLoading } from '@/store/slices/cartSlice';
import { pushToast } from '@/store/slices/toastSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.cart);
  const isAuthed = useSelector((s) => s.auth.status === 'authenticated');

  useEffect(() => {
    if (!isAuthed) return;
    dispatch(setCartLoading(true));
    cartApi
      .get()
      .then((cart) => dispatch(setCart(cart)))
      .catch(() => {})
      .finally(() => dispatch(setCartLoading(false)));
  }, [isAuthed, dispatch]);

  const addItem = async (productId, quantity = 1) => {
    if (!isAuthed) {
      dispatch(
        pushToast({ title: 'Please sign in', description: 'You need an account to add items', tone: 'info' })
      );
      return;
    }
    const cart = await cartApi.add({ productId, quantity });
    dispatch(setCart(cart));
    dispatch(pushToast({ title: 'Added to cart', tone: 'success' }));
  };

  const updateItem = async (productId, quantity) => {
    const cart = await cartApi.update(productId, quantity);
    dispatch(setCart(cart));
  };

  const removeItem = async (productId) => {
    const cart = await cartApi.remove(productId);
    dispatch(setCart(cart));
  };

  const clear = async () => {
    const cart = await cartApi.clear();
    dispatch(setCart(cart));
  };

  const itemCount = data?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const subtotal = data?.items?.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0) || 0;

  return { cart: data, loading, itemCount, subtotal, addItem, updateItem, removeItem, clear };
};
