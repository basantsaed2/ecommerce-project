// src/app/page.tsx
import BannersSection from "@/components/modules/home/BannersSection";
import CategoriesSection from "@/components/modules/home/CategoriesSection";
import ProductsSection from "@/components/modules/home/ProductsSection";
import BrandsSection from "@/components/modules/home/BrandsSection";

export default function Home() {
    return (
        <div className="w-full px-4 md:px-8 xl:px-12 flex flex-col gap-6">
            <BannersSection />
            <CategoriesSection />
            <ProductsSection />
            <BrandsSection />
        </div>
    );
}