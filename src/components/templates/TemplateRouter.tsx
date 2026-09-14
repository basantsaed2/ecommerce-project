'use client';

import React from 'react';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import DefaultTemplate from '@/components/templates/default/DefaultTemplate';
import ExampleTemplate from '@/components/templates/example/ExampleTemplate';
import MarwanTemplate from '@/components/templates/marwan/MarwanTemplate';

interface TemplateRouterProps {
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

export default function TemplateRouter({
    searchQuery = '',
    excludeKeys = [],
    className = '',
}: TemplateRouterProps) {
    const { templateSlug, isLoading } = useStoreSettings();

    if (isLoading && !templateSlug) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
            </div>
        );
    }

    const slug = (templateSlug || 'default').toLowerCase();

    switch (slug) {
        case 'example':
            return (
                <ExampleTemplate
                    searchQuery={searchQuery}
                    excludeKeys={excludeKeys}
                    className={className}
                />
            );
        case 'marwan':
            return (
                <MarwanTemplate
                    searchQuery={searchQuery}
                    excludeKeys={excludeKeys}
                    className={className}
                />
            );
        case 'default':
        default:
            return (
                <DefaultTemplate
                    searchQuery={searchQuery}
                    excludeKeys={excludeKeys}
                    className={className}
                />
            );
    }
}