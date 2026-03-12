import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';

export const useGet = <T>(
    key: any[],
    url: string,
    options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<T, Error>({
        queryKey: key,
        queryFn: async () => {
            const { data } = await axiosInstance.get<T>(url);
            return data;
        },
        ...options,
    });
};