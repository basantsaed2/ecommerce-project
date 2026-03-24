'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

async function fetchTenantInfo() {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/store/tenant-info`);
    return data;
}

export default function TenantGuard({ children }: { children: React.ReactNode }) {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant-info'],
        queryFn: fetchTenantInfo,
        staleTime: Infinity,
    });

    if (isLoading) return null;

    const haveEcommerce = data?.data?.features?.haveEcommerce ?? true;

    if (!haveEcommerce) {
        return (
            <div className="bg-gray-50 flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Ecommerce is not available</h1>
                    <p className="text-gray-600 mb-6">
                        This application doesn&apos;t have ecommerce features enabled at the moment.
                    </p>
                    <a
                        href={process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || '#'}
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Admin Login
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
