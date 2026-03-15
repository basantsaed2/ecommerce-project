import axiosInstance from './axiosInstance';
import { AddToCartRequest, UpdateQuantityRequest } from '@/types/cart';

export const cartApi = {
    getCart: () => axiosInstance.get('/api/store/cart'),
    addToCart: (data: AddToCartRequest) => axiosInstance.post('/api/store/cart/add', data),
    updateQuantity: (data: UpdateQuantityRequest) => axiosInstance.put('/api/store/cart/update-quantity', data),
    removeFromCart: (productId: string) => axiosInstance.delete(`/api/store/cart/remove/${productId}`),
    clearCart: () => axiosInstance.delete('/api/store/cart/clear'),
};
