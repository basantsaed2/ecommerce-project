'use client';

import React from 'react';
import TemplateRouter from '@/components/templates/TemplateRouter';

interface StoreTemplateRendererProps {
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

export default function StoreTemplateRenderer({
    searchQuery = '',
    excludeKeys = [],
    className = '',
}: StoreTemplateRendererProps) {
    return (
        <div className={`w-full ${className}`}>
            <TemplateRouter
                searchQuery={searchQuery}
                excludeKeys={excludeKeys}
                className={className}
            />
        </div>
    );
}