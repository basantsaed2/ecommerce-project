import axiosInstance from './axiosInstance';
import { UpdateProfileRequest } from '@/types/auth';

export const userApi = {
    getProfile: () => axiosInstance.get('/auth/get-profile'),
    updateProfile: (id: string, data: Partial<UpdateProfileRequest>) => 
        axiosInstance.put(`/auth/edit-profile/${id}`, data),
};
