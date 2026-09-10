'use client';

import React from 'react';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';

interface DefaultTemplateProps {
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

export default function DefaultTemplate({
    searchQuery = '',
    excludeKeys = ['footer'],
    className = '',
}: DefaultTemplateProps) {
    const { sections } = useStoreSettings();

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            default template
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">Storefront</h2>
                    </div>
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                        Shop Now
                    </button>
                </div>
            </div>

            <DynamicSectionRenderer
                sections={sections}
                searchQuery={searchQuery}
                excludeKeys={excludeKeys}
            />
        </div>
    );
}
