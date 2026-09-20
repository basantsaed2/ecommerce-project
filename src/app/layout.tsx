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
    const initialSettings = await getInitialStoreSettings();

    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <StoreProvider>
                    <QueryProvider>
                        <StoreThemeProvider initialSettings={initialSettings}>
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