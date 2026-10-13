'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { getCurrentLanguage } from '@/utils/language';
import { ApiResponse } from '@/types/api';

export function usePaginatedGet<T>(key: string[], url: string, pageSize: number) {
    return useInfiniteQuery({
        queryKey: [...key, getCurrentLanguage(), pageSize],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const { data } = await axiosInstance.get<ApiResponse<T>>(url, {
                params: { page: pageParam, limit: pageSize },
            });
            return data;
        },
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const items = lastPage.data?.data;
            return Array.isArray(items) && items.length === pageSize
                ? lastPageParam + 1
                : undefined;
        },
    });
}
