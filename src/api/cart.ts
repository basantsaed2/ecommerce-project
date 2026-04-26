import axiosInstance from './axiosInstance';
import { AddToCartRequest, UpdateQuantityRequest } from '@/types/cart';

export const cartApi = {
    getCart: () => axiosInstance.get('/cart'),
    addToCart: (data: AddToCartRequest) => axiosInstance.post('/cart/add', data),
    updateQuantity: (data: UpdateQuantityRequest) => axiosInstance.put('/cart/update-quantity', data),
    removeFromCart: (productId: string) => axiosInstance.delete(`/cart/remove/${productId}`),
    clearCart: () => axiosInstance.delete('/cart/clear'),
    applyCoupon: (couponCode: string) => axiosInstance.post('/cart/apply-coupon', { couponCode }),
    removeCoupon: () => axiosInstance.post('/cart/remove-coupon'),
};
