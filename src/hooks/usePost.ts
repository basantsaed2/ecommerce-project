// src/hooks/api/usePost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

export const usePost = <TVariables = any, TData = any>(
    url: string,
    queryKeyToInvalidate?: any[],
    successMessage?: string | ((data: TData) => string)
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables>({
        mutationFn: async (newData: TVariables) => {
            const { data } = await axiosInstance.post<TData>(url, newData);
            return data;
        },
        onSuccess: (data) => {
            const msg = typeof successMessage === 'function'
                ? successMessage(data)
                : successMessage || 'Created successfully';
            toast.success(msg);

            if (queryKeyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Something went wrong';
            toast.error(message);
        },
    });
};