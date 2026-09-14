"use client";

import React, { useState } from 'react';
import TemplateRouter from '@/components/templates/TemplateRouter';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="w-full flex flex-col gap-4">
            <TemplateRouter
                searchQuery={searchQuery}
                excludeKeys={['footer']}
            />
        </div>
    );
}