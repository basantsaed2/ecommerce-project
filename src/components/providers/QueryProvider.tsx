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
                retry: 1, // لو الطلب فشل يعيد المحاولة مرة واحدة بس
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* الـ Devtools دي بتساعدك تشوف الـ Requests اللي بتحصل وانت شغال (اختياري) */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}