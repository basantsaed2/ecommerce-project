// src/hooks/api/useUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

interface UpdateParams<T> {
    id: string | number;
    updatedData: T;
}

export const useUpdate = <TVariables = any, TData = any>(
    url: string,
    queryKeyToInvalidate?: any[],
    successMessage?: string | ((data: TData) => string)
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, UpdateParams<TVariables>>({
        mutationFn: async ({ id, updatedData }) => {
            const { data } = await axiosInstance.put<TData>(`${url}/${id}`, updatedData);
            return data;
        },
        onSuccess: (data) => {
            const msg = typeof successMessage === 'function'
                ? successMessage(data)
                : successMessage || 'Updated successfully';
            toast.success(msg);

            if (queryKeyToInvalidate) {
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }
        },
        onError: (error: any) => {
            const data = error.response?.data;
            // Robust extractor for message from different backend structures
            const message = data?.error?.message || data?.message || error.message || 'Update failed';
            toast.error(message);
        },
    });
};