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


            <DynamicSectionRenderer
                sections={sections}
                searchQuery={searchQuery}
                excludeKeys={excludeKeys}
            />
        </div>
    );
}
