import axiosInstance from './axiosInstance';
import { UpdateProfileRequest } from '@/types/auth';

export const userApi = {
    getProfile: () => axiosInstance.get('/api/store/auth/get-profile'),
    updateProfile: (id: string, data: Partial<UpdateProfileRequest>) => 
        axiosInstance.put(`/api/store/auth/edit-profile/${id}`, data),
};
