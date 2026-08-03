"use client";

import React from "react";
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // البيانات تعتبر طازجة لمدة دقيقة
                refetchOnWindowFocus: false, // منع إعادات الجلب عند التنقل بين التابات
                retry: (failureCount, error: any) => {
                    // إيقاف الـ Retry فوراً لو المشكلة مشكلة شبكة أو السيرفر فاصل
                    if (
                        error?.message === "Network Error" ||
                        !error?.response ||
                        error?.code === "ERR_NETWORK"
                    ) {
                        return false;
                    }
                    // لأي خطأ آخر يحاول مرة واحدة فقط
                    return failureCount < 1;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) {
        return makeQueryClient();
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}