"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category, Product } from '@/types/api';
import DynamicBanner from '@/components/common/DynamicBanner';
import { Loader2, Grid, Package, ArrowLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';
import { useSearchParams } from 'next/navigation';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import Link from 'next/link';

// ── Type for single category API response ────────────────────────────────
interface CategoryDetail extends Category {
    banner?: string;
    Is_Online?: boolean;
    order?: number;
}

interface CategoryDetailResponse {
    success: boolean;
    data: {
        message: string;
        data: CategoryDetail;
    };
}

export default function CategoriesPage() {
    const { logoUrl } = useStoreSettings();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('id');

    // ── 1. Fetch all categories (for sidebar/list view) ────────────────────
    const { data: categoriesData, isLoading: isLoadingCats } = useGet<ApiResponse<Category>>(
        ['categories'],
        '/category'
    );

    // ── 2. Fetch single category detail via /category/{id} ─────────────────
    const { data: categoryDetailData, isLoading: isLoadingCatDetail } = useGet<CategoryDetailResponse>(
        ['category', selectedId || ''],
        `/category/${selectedId}`,
        { enabled: !!selectedId }
    );

    // ── 3. Fetch all products ───────────────────────────────────────────────
    const { data: productsData, isLoading: isLoadingProds } = useGet<ApiResponse<Product>>(
        ['products'],
        '/product'
    );

    const isLoading = isLoadingCats || isLoadingProds || (!!selectedId && isLoadingCatDetail);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-secondary" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs text-gray-400">Curating Collections...</p>
            </div>
        );
    }

    const allCategories = categoriesData?.data?.data || [];
    const allProducts = productsData?.data?.data || [];

    // ── Helper: match product to a category ID ──────────────────────────────
    const getProductsForCategory = (categoryId: string): Product[] => {
        return allProducts.filter((p) => {
            // 1. Check `categories` array (returned by the products API)
            const cats = (p as any).categories as Array<{ _id: string; name: string }> | undefined;
            if (Array.isArray(cats) && cats.some((c) => c._id === categoryId)) return true;

            // 2. Check `categoryId` array (legacy field)
            if (Array.isArray(p.categoryId) && p.categoryId.some((c) => (typeof c === 'string' ? c : c._id) === categoryId)) return true;

            // 3. Check single `category` object
            if (p.category && (typeof p.category === 'string' ? p.category : p.category._id) === categoryId) return true;

            return false;
        });
    };

    // ── SINGLE CATEGORY VIEW (when ?id= is present) ─────────────────────────
    if (selectedId) {
        const categoryDetail = categoryDetailData?.data?.data;
        const categoryInfo = categoryDetail || allCategories.find((c) => c._id === selectedId);
        const categoryProducts = getProductsForCategory(selectedId);

        if (!categoryInfo) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Grid className="text-gray-200" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-primary mb-2">Category not found</h3>
                    <Link href="/categories" className="text-secondary font-bold hover:underline flex items-center gap-1 mt-2">
                        <ArrowLeft size={16} /> Back to all categories
                    </Link>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50/30 pb-20">
                {/* ── Category Hero ───────────────────────────────────────── */}
                <section className="relative h-[340px] md:h-[420px] flex items-end overflow-hidden">
                    <img
                        src={(categoryDetail as any)?.banner || categoryInfo.image || undefined}
                        alt={categoryInfo.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Breadcrumb */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 text-white/70 text-xs font-bold">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                        <ChevronRight size={14} />
                        <span className="text-white">{categoryInfo.name}</span>
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10">
                        <div className="flex items-end gap-5">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl shrink-0">
                                <img
                                    src={categoryInfo.image || logoUrl || undefined}
                                    alt={categoryInfo.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight capitalize">
                                        {categoryInfo.name}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        categoryProducts.length > 0
                                            ? 'bg-secondary/90 text-white'
                                            : 'bg-white/20 text-white/80'
                                    }`}>
                                        {categoryProducts.length} Products
                                    </span>
                                </div>
                                <Link
                                    href="/categories"
                                    className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold transition-colors"
                                >
                                    <ArrowLeft size={14} /> All Categories
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Products Grid ──────────────────────────────────────── */}
                <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
                    {categoryProducts.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-primary">
                                    Products in <span className="text-secondary">{categoryInfo.name}</span>
                                </h2>
                                <span className="text-sm text-gray-500 font-medium">{categoryProducts.length} items found</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {categoryProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Package size={36} className="text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-primary mb-3">No products yet</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto mb-6">
                                We are currently restocking this category. Check back soon for fresh arrivals!
                            </p>
                            <Link
                                href="/categories"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-full hover:bg-primary transition-colors text-sm"
                            >
                                <ArrowLeft size={16} /> Browse other categories
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── ALL CATEGORIES VIEW (no ?id=) ────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Creative Hero Section */}
            <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden mb-8 bg-primary">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
                    <DynamicBanner
                        pageName="category"
                        fallbackImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Categories"
                        className="w-full h-full object-cover scale-110 blur-sm opacity-50"
                    />
                </div>

                <div className="relative z-20 container mx-auto px-6 text-center md:text-left">
                    <div className="inline-block px-4 py-1.5 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full text-secondary text-xs font-black uppercase tracking-[0.2em] mb-6">
                        Explore Catalog
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                        Shop By <br />
                        <span className="text-secondary italic">Collection.</span>
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                        Discover a curated range of premium products organized by lifestyle and preference.
                    </p>
                </div>

                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
            </section>

            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
                {allCategories.length === 0 ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Grid className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-primary mb-2">No collections found</h3>
                        <p className="text-gray-400 font-medium max-w-xs">We are currently updating our catalog. Please check back soon.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-20">
                        {allCategories.map((category) => {
                            const categoryProducts = getProductsForCategory(category._id);
                            const hasProducts = categoryProducts.length > 0;

                            if (!hasProducts) return null;

                            return (
                                <div key={category._id} id={category._id} className="scroll-mt-32">
                                    {/* Category Header */}
                                    <div className="relative group mb-10">
                                        <div className="absolute -inset-4 bg-gradient-to-r from-gray-100 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                                            <Link
                                                href={`/categories?id=${category._id}`}
                                                className="w-24 h-24 rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-gray-200/50 p-1 shrink-0 transform group-hover:-rotate-3 transition-transform duration-500"
                                            >
                                                <div className="w-full h-full rounded-[28px] overflow-hidden">
                                                    <img
                                                        src={category.image || logoUrl || undefined}
                                                        alt={category.name || category.ar_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </Link>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Link href={`/categories?id=${category._id}`}>
                                                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter capitalize hover:text-secondary transition-colors">
                                                            {category.name || category.ar_name}
                                                        </h2>
                                                    </Link>
                                                    <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-gray-100 text-gray-500">
                                                        {categoryProducts.length} Products
                                                    </span>
                                                </div>
                                                <div className="h-1 w-20 bg-secondary rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-500" />
                                            </div>

                                            <Link
                                                href={`/categories?id=${category._id}`}
                                                className="shrink-0 px-5 py-2.5 bg-secondary text-white text-xs font-bold rounded-full hover:bg-primary transition-colors flex items-center gap-2"
                                            >
                                                View All <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Product Grid - first 5 */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                        {categoryProducts.slice(0, 5).map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>

                                    {categoryProducts.length > 5 && (
                                        <div className="mt-6 text-center">
                                            <Link
                                                href={`/categories?id=${category._id}`}
                                                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-secondary text-secondary font-bold rounded-full hover:bg-secondary hover:text-white transition-all text-sm"
                                            >
                                                See all {categoryProducts.length} products <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
