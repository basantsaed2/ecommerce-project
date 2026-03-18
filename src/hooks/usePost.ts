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
        onSuccess: (data: any) => {
            const apiMessage = data?.message || data?.data?.message;
            let msg = apiMessage;
            
            if (!msg) {
                msg = typeof successMessage === 'function'
                    ? successMessage(data)
                    : successMessage || 'Created successfully';
            }
            
            // Only show toast if msg is truthy (some components might pass null intentionally to suppress)
            if (msg) toast.success(msg);

            if (queryKeyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }
        },
        onError: (error: any) => {
            const data = error.response?.data;
            // Robust extractor for message from different backend structures
            const message = data?.error?.message || data?.message || error.message || 'Something went wrong';
            toast.error(message);
        },
    });
};