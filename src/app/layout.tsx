import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import FooterWrapper from "@/components/layout/FooterWrapper";
import { StoreProvider } from "@/store/provider";
import QueryProvider from "@/components/providers/QueryProvider";
import CartInitializer from "@/components/providers/CartInitializer";
import TenantGuard from "@/components/providers/TenantGuard";
import { StoreThemeProvider } from "@/components/providers/StoreThemeProvider";
import "./globals.css";
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <StoreProvider>
                    <QueryProvider>
                        <TenantGuard>
                            <StoreThemeProvider>
                                <CartInitializer>
                                    <Toaster position="top-right" richColors closeButton duration={1500} />
                                    <AnnouncementBar />
                                    <Navbar />
                                    <main className="pt-2 pb-20 lg:pb-0 min-h-[calc(100vh-80px)]">
                                        {children}
                                    </main>
                                    <FooterWrapper />
                                </CartInitializer>
                            </StoreThemeProvider>
                        </TenantGuard>
                    </QueryProvider>
                </StoreProvider>
            </body>
        </html>
    );
}