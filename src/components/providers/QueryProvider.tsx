"use client"; // مهم جداً لأن QueryClientProvider بيستخدم الـ Context
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    // بنستخدم useState عشان نضمن إن الـ QueryClient يتكريت مرة واحدة بس لكل Session
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // البيانات تعتبر "fresh" لمدة دقيقة
                retry: (failureCount, error: any) => {
                    // Stop retrying if it's a network error (no response or server down)
                    if (error?.message === 'Network Error' || !error?.response || error?.code === 'ERR_NETWORK') {
                        return false;
                    }
                    // For other errors, retry only once
                    return failureCount < 1;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            }
        }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* الـ Devtools دي بتساعدك تشوف الـ Requests اللي بتحصل وانت شغال (اختياري) */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}