import axiosInstance from './axiosInstance';
import { AddToCartRequest, UpdateQuantityRequest } from '@/types/cart';

export const cartApi = {
    getCart: () => axiosInstance.get('/cart'),
    syncCart: (items: any[]) => axiosInstance.post('/cart/sync-cart', { items }),
    clearCart: () => axiosInstance.delete('/cart/clear'),
    applyCoupon: (couponCode: string) => axiosInstance.post('/cart/apply-coupon', { couponCode }),
    removeCoupon: () => axiosInstance.post('/cart/apply-coupon', { couponCode: "" }),
};
