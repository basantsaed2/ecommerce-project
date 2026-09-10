'use client';

import React from 'react';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';

interface StoreTemplateRendererProps {
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

export default function StoreTemplateRenderer({
    searchQuery = '',
    excludeKeys = ['footer'],
    className = '',
}: StoreTemplateRendererProps) {
    const { templateSlug, sections } = useStoreSettings();

    const isExampleTemplate = (templateSlug || '').toLowerCase() === 'example';

    if (isExampleTemplate) {
        return (
            <div className={`w-full ${className}`}>
                <div className="mb-6 rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 p-8 text-white shadow-lg">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100">example</p>
                    <h1 className="mt-3 text-4xl font-bold">Summer Sale</h1>
                    <p className="mt-3 max-w-xl text-sm text-sky-100">
                        Modern storefront template powered by the backend template slug.
                    </p>
                    <button className="mt-6 rounded-full bg-white px-5 py-3 font-semibold text-sky-600 shadow-sm">
                        Shop Now →
                    </button>
                </div>

                <DynamicSectionRenderer
                    sections={sections}
                    searchQuery={searchQuery}
                    excludeKeys={excludeKeys}
                    className="mt-6"
                />
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <DynamicSectionRenderer
                sections={sections}
                searchQuery={searchQuery}
                excludeKeys={excludeKeys}
            />
        </div>
    );
}
