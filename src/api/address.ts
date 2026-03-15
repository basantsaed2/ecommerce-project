import axiosInstance from './axiosInstance';
import { AddressRequest } from '@/types/address';

export const addressApi = {
    getLists: () => axiosInstance.get('/api/store/address/lists'),
    getAddresses: () => axiosInstance.get('/api/store/address'),
    addAddress: (data: AddressRequest) => axiosInstance.post('/api/store/address', data),
    updateAddress: (id: string, data: Partial<AddressRequest>) => 
        axiosInstance.put(`/api/store/address/${id}`, data),
    deleteAddress: (id: string) => axiosInstance.delete(`/api/store/address/${id}`),
};
