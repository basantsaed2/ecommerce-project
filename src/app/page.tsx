"use client";
import React, { useState } from 'react';
import BannersSection from "@/components/modules/home/BannersSection";
import CategoriesSection from "@/components/modules/home/CategoriesSection";
import ProductsSection from "@/components/modules/home/ProductsSection";
import BrandsSection from "@/components/modules/home/BrandsSection";
import SearchBar from "@/components/ui/SearchBar";

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="w-full px-4 md:px-8 xl:px-12 flex flex-col gap-6">
            <BannersSection />
            <div className="py-4">
                <SearchBar onSearch={setSearchQuery} />
            </div>
            <CategoriesSection searchQuery={searchQuery} />
            <ProductsSection searchQuery={searchQuery} />
            <BrandsSection />
        </div>
    );
}