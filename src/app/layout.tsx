import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import FooterWrapper from "@/components/layout/FooterWrapper";
import { StoreProvider } from "@/store/provider";
import QueryProvider from "@/components/providers/QueryProvider";
import CartInitializer from "@/components/providers/CartInitializer";
import TenantGuard from "@/components/providers/TenantGuard";
import { StoreThemeProvider } from "@/components/providers/StoreThemeProvider";
import type { StoreSettings } from '@/types/storeSettings';
import "./globals.css";
import { Toaster } from 'sonner';
import axiosInstance from "@/api/axiosInstance";
import { cookies } from 'next/headers';
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE } from '@/utils/language';

export const dynamic = 'force-dynamic';

const getInitialStoreSettings = async (): Promise<StoreSettings | undefined> => {
    try {
        const { data } = await axiosInstance.get('/store-settings', {
            headers: { Accept: 'application/json' },
        });

        return data?.data?.settings;
    } catch {
        return undefined;
    }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const [initialSettings, cookieStore] = await Promise.all([
        getInitialStoreSettings(),
        cookies(),
    ]);
    const initialLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value === 'en' ? 'en' : DEFAULT_LANGUAGE;

    return (
        <html lang={initialLanguage} dir={initialLanguage === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <StoreProvider>
                    <QueryProvider>
                        <StoreThemeProvider initialSettings={initialSettings} initialLanguage={initialLanguage}>
                            <TenantGuard>
                                <CartInitializer>
                                    <Toaster position="top-right" richColors closeButton duration={1500} />
                                    <Navbar />
                                    <main className="pt-2 pb-20 lg:pb-0 min-h-[calc(100vh-80px)]">
                                        {children}
                                    </main>
                                    <FooterWrapper />
                                </CartInitializer>
                            </TenantGuard>
                        </StoreThemeProvider>
                    </QueryProvider>
                </StoreProvider>
            </body>
        </html>
    );
}