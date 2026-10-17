'use client';

import { useState } from 'react';

interface StoreLoaderProps {
    logoUrl?: string | null;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
};

export default function StoreLoader({ logoUrl, label, size = 'md' }: StoreLoaderProps) {
    const [logoFailed, setLogoFailed] = useState(false);
    const showLogo = Boolean(logoUrl) && !logoFailed;

    return (
        <div className="flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
            {showLogo ? (
                <div className={`relative ${sizeClasses[size]}`}>
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-200 border-t-secondary" />
                    <div className="absolute inset-1 flex items-center justify-center rounded-xl  p-1 shadow-sm">
                        <img
                            src={logoUrl || undefined}
                            alt=""
                            aria-hidden="true"
                            loading="eager"
                            decoding="async"
                            className="block h-full w-full object-contain"
                            style={{ opacity: 0.85 }}
                            onError={() => setLogoFailed(true)}
                        />
                    </div>
                </div>
            ) : (
                <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-secondary`} />
            )}
            {label && <p className="text-sm font-bold text-gray-500">{label}</p>}
        </div>
    );
}
