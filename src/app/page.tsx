"use client";

import React, { useState } from 'react';
import SearchBar from "@/components/ui/SearchBar";
import TemplateRouter from '@/components/templates/TemplateRouter';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="w-full px-4 md:px-8 xl:px-12 flex flex-col gap-4">
            <div className="pt-2 pb-2">
                <SearchBar onSearch={setSearchQuery} />
            </div>

            <TemplateRouter
                searchQuery={searchQuery}
                excludeKeys={['footer']}
            />
        </div>
    );
}