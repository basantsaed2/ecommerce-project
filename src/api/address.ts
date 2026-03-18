import axiosInstance from './axiosInstance';
import { AddressRequest } from '@/types/address';

export const addressApi = {
    getLists: () => axiosInstance.get('/address/lists'),
    getAddresses: () => axiosInstance.get('/address'),
    addAddress: (data: AddressRequest) => axiosInstance.post('/address', data),
    updateAddress: (id: string, data: Partial<AddressRequest>) => 
        axiosInstance.put(`/address/${id}`, data),
    deleteAddress: (id: string) => axiosInstance.delete(`/address/${id}`),
};
