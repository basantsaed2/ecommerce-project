"use client";
import React, { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse } from '@/types/api';
import { Loader2, X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToCart, addToCartLocal } from '@/store/slices/cartSlice';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

interface ProductDialogProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDialog({ productId, isOpen, onClose }: ProductDialogProps) {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);
    const [quantity, setQuantity] = useState(1);

    const { data, isLoading, error } = useGet<SingleApiResponse<Product>>(
        ['product', productId],
        `/api/store/product/${productId}`,
        { enabled: isOpen } // Only fetch when dialog is open
    );

    if (!isOpen) return null;

    const product = data?.data?.data;

    const handleAddToCart = () => {
        if (!product) return;

        if (token) {
            // If logged in, only dispatch the sync thunk
            dispatch(addItemToCart({
                productId: product._id,
                quantity: quantity
            }) as any);
        } else {
            // If guest, only update local state
            dispatch(addToCartLocal({
                product: {
                    _id: product._id,
                    name: product.name,
                    ar_name: product.ar_name,
                    image: product.image,
                    price: product.price
                },
                quantity: quantity,
                price: product.price
            }));
        }

        toast.success(`Processing...`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-500 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {isLoading || !product ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader2 className="animate-spin text-secondary" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Image Section */}
                        <div className="md:w-1/2 md:border-r border-gray-100 bg-gray-50 flex items-center justify-center p-8 lg:p-12 min-h-[300px]">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="max-w-full max-h-[400px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Content Section */}
                        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
                            <div>
                                {product.is_featured && (
                                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                        Featured Item
                                    </span>
                                )}
                                <h2 className="text-3xl font-black text-primary mb-2 leading-tight">
                                    {product.name || product.ar_name}
                                </h2>

                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {product.description || product.ar_description || "No description provided for this product. High quality and verified."}
                                </p>

                                <div className="flex items-end gap-3 mb-8">
                                    <span className="text-4xl font-black text-secondary">
                                        ${product.price?.toLocaleString()}
                                    </span>
                                    {product.cost && (
                                        <span className="text-lg font-bold text-gray-400 line-through mb-1">
                                            ${(product.price * 1.25).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Quantity Counter */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-3">Quantity</label>
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 w-fit rounded-2xl p-2">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:border-secondary transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:border-secondary transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <ShoppingCart size={22} />
                                    Add To Cart • ${(product.price * quantity).toLocaleString()}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
