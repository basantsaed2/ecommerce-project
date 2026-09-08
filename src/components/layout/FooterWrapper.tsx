"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import DefaultFooter from '@/components/sections/footer/DefaultFooter';
import ModernFooter from '@/components/sections/footer/ModernFooter';

export default function FooterWrapper() {
    const pathname = usePathname();
    const { settings, templateSlug } = useStoreSettings();

    // Hide footer on auth pages
    const authRoutes = ['/login', '/signup'];
    if (authRoutes.includes(pathname)) return null;

    // Check if footer section is enabled in store settings
    const footerSection = settings.sections?.find((s) => s.key === 'footer');
    if (footerSection && footerSection.enabled === false) {
        return null;
    }

    const currentTemplate = footerSection?.templateSlug || templateSlug || 'default';

    if (currentTemplate === 'modern-shop') {
        return <ModernFooter />;
    }

    return <DefaultFooter />;
}
