// src/hooks/api/useDelete.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

export const useDelete = (
    url: string,
    queryKeyToInvalidate?: any[],
    successMessage?: string
) => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, string>({
        mutationFn: async (id: string) => {
            const { data } = await axiosInstance.delete(`${url}/${id}`);
            return data;
        },
        onSuccess: () => {
            toast.success(successMessage || 'Deleted successfully');

            if (queryKeyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }
        },
        onError: (error: any) => {
            const data = error.response?.data;
            const message = data?.error?.message || data?.message || error.message || 'Deletion failed';
            toast.error(message);
        },
    });
};
