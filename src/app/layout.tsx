import Navbar from "@/components/layout/Navbar";
import { StoreProvider } from "@/store/provider";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <StoreProvider>
                    <QueryProvider>
                        <Toaster position="top-right" richColors closeButton />
                        <Navbar />
                        <main className="pt-20 pb-20 lg:pb-0">
                            {children}
                        </main>
                    </QueryProvider>
                </StoreProvider>
            </body>
        </html>
    );
}