// src/app/page.tsx
// import HomeBanner from "@/components/modules/HomeBanner";
// import CategoriesSection from "@/components/modules/CategoriesSection";

export default function Home() {
    return (
        <div className="flex flex-col gap-8">
            {/* 1. السلايدر الرئيسي */}
            {/* <HomeBanner /> */}

            {/* 2. قسم الأصناف (الأيقونات الدائرية) */}
            {/* <CategoriesSection /> */}

            {/* 3. قسم الأخبار أو المنتجات */}
            <section className="container mx-auto px-4 py-10">
                <h2 className="text-2xl font-bold text-primary mb-6">Latest News & Offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-secondary/10 rounded-3xl flex items-center justify-center border-2 border-dashed border-secondary/20">
                        <p className="text-secondary font-bold">New Summer Collection - Coming Soon!</p>
                    </div>
                    <div className="h-48 bg-primary/5 rounded-3xl flex items-center justify-center border-2 border-dashed border-primary/20">
                        <p className="text-primary font-bold">Flash Sale: Up to 50% Off</p>
                    </div>
                </div>
            </section>
        </div>
    );
}