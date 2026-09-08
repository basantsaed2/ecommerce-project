"use client";

import React, { useState } from 'react';
import { Product, ApiResponse } from '@/types/api';
import { useGet } from '@/hooks/useGet';
import { Plus, Check, ShoppingCart, Sparkles, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { AppDispatch } from '@/store/store';
import { toast } from 'sonner';

interface FrequentlyBoughtTogetherProps {
    currentProduct: Product;
}

export default function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useGet<ApiResponse<Product>>(['products'], '/product');
    const allProducts = data?.data?.data || [];

    // Select 2 complementary items from other products
    const complementaryItems = allProducts
        .filter(p => p._id !== currentProduct._id)
        .slice(0, 2);

    const [selectedIds, setSelectedIds] = useState<string[]>([
        currentProduct._id,
        ...complementaryItems.map(c => c._id)
    ]);
    const [isAddingBundle, setIsAddingBundle] = useState(false);

    if (complementaryItems.length === 0) return null;

    const allBundleCandidates = [currentProduct, ...complementaryItems];
    const activeBundleItems = allBundleCandidates.filter(item => selectedIds.includes(item._id));

    const bundleTotal = activeBundleItems.reduce((acc, item) => {
        const price = item.final_price || item.price || item.main_price || 0;
        return acc + price;
    }, 0);

    const originalTotal = activeBundleItems.reduce((acc, item) => {
        const price = item.main_price || item.price || item.final_price || 0;
        return acc + price;
    }, 0);

    const discountAmount = Math.max(0, originalTotal - bundleTotal);

    const toggleItem = (id: string) => {
        if (id === currentProduct._id) return; // Main product cannot be unselected
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleAddBundleToCart = async () => {
        setIsAddingBundle(true);
        try {
            for (const item of activeBundleItems) {
                const sku = item.skus?.[0];
                dispatch(addItem({
                    product: item,
                    variant: sku,
                    quantity: 1,
                }));
            }
            await dispatch(syncCart());
            toast.success(`Successfully added ${activeBundleItems.length} bundle items to cart!`);
        } catch (error) {
            toast.error('Failed to add bundle to cart');
        } finally {
            setIsAddingBundle(false);
        }
    };

    return (
        <section className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-secondary" />
                <h3 className="text-lg sm:text-xl font-black text-primary">
                    Frequently Bought Together
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Images row with + signs */}
                <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
                    {allBundleCandidates.map((item, idx) => {
                        const isSelected = selectedIds.includes(item._id);
                        const isMain = item._id === currentProduct._id;

                        return (
                            <React.Fragment key={item._id}>
                                {idx > 0 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold shrink-0">
                                        <Plus size={16} />
                                    </div>
                                )}

                                <div
                                    onClick={() => toggleItem(item._id)}
                                    className={`relative rounded-2xl border-2 p-2 transition-all cursor-pointer flex flex-col items-center gap-2 w-28 sm:w-32 bg-white ${
                                        isSelected ? 'border-secondary shadow-md' : 'border-gray-200 opacity-50'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold z-10">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}

                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="text-center w-full">
                                        <p className="text-[11px] font-bold text-gray-800 line-clamp-1">
                                            {isMain ? 'This Item' : (item.name || item.ar_name)}
                                        </p>
                                        <p className="text-xs font-black text-secondary mt-0.5">
                                            {(item.final_price || item.price || item.main_price || 0).toLocaleString()} EGP
                                        </p>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Bundle Summary & Add Button */}
                <div className="lg:col-span-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                    <div>
                        <span className="text-xs font-bold text-gray-500 block">Total for {activeBundleItems.length} items:</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-secondary">
                                {bundleTotal.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-gray-400">EGP</span>
                            {discountAmount > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                    {originalTotal.toLocaleString()} EGP
                                </span>
                            )}
                        </div>
                        {discountAmount > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                Save {discountAmount.toLocaleString()} EGP on this bundle
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddBundleToCart}
                        disabled={isAddingBundle || activeBundleItems.length === 0}
                        className="w-full py-3.5 px-4 bg-primary text-white hover:bg-secondary rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 duration-200"
                    >
                        {isAddingBundle ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <ShoppingCart size={16} />
                        )}
                        <span>Add Bundle to Cart</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
