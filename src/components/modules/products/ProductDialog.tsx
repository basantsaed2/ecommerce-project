"use client";
import React, { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse } from '@/types/api';
import { Loader2, X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToCart } from '@/store/slices/cartSlice';
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { data, isLoading, error } = useGet<SingleApiResponse<Product>>(
        ['product', productId],
        `/product/${productId}`,
        { enabled: isOpen } // Only fetch when dialog is open
    );

    if (!isOpen) return null;

    const product = data?.data?.data;

    const handleAddToCart = () => {
        if (!product) return;
        
        if (product.quantity <= 0) {
            toast.error('This product is currently sold out');
            return;
        }

        dispatch(addItemToCart({
            productId: product._id,
            quantity: quantity
        }) as any);

        toast.success(`Processing...`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-y-auto md:overflow-hidden relative flex flex-col md:flex-row transform transition-all max-h-[95vh] md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[110] p-2 bg-white/80 backdrop-blur-sm hover:bg-red-500 text-gray-600 hover:text-white rounded-full transition-all active:scale-95 shadow-sm border border-gray-100"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {isLoading || !product ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader2 className="animate-spin text-secondary" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 md:border-r border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-6 md:p-10 min-h-[280px] md:min-h-[450px] relative shrink-0">
                            <div className="relative w-full aspect-square md:aspect-square flex items-center justify-center mb-6 max-h-[250px] md:max-h-none">
                                <img
                                    src={selectedImage || product.image}
                                    alt={product.name}
                                    className={`max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-500 ${product.quantity > 0 ? 'hover:scale-105' : 'grayscale opacity-80'}`}
                                />
                                {product.quantity <= 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-3xl">
                                        <div className="bg-red-500 text-white font-black px-6 py-2 rounded-xl transform -rotate-12 shadow-xl text-xl tracking-widest uppercase border-4 border-white">
                                            Sold Out
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Thumbnails */}
                            {(product.gallery_product && product.gallery_product.length > 0) && (
                                <div className="flex flex-wrap justify-center gap-2 mt-auto w-full pb-4 md:pb-0">
                                    {[product.image, ...product.gallery_product].map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 transition-all overflow-hidden bg-white p-1 ${
                                                (selectedImage === img || (!selectedImage && img === product.image))
                                                    ? 'border-secondary shadow-md scale-110'
                                                    : 'border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between md:overflow-y-auto">
                            <div>
                                {product.is_featured && (
                                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                        Featured Item
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-3xl font-black text-primary mb-3 leading-tight">
                                    {product.name || product.ar_name}
                                </h1>

                                <p className="text-gray-500 text-base md:text-sm mb-8 leading-relaxed">
                                    {product.description || product.ar_description || "No description provided for this product. High quality and verified."}
                                </p>

                                <div className="flex items-end gap-3 mb-10">
                                    <span className="text-4xl md:text-4xl font-black text-secondary">
                                        {product.price?.toLocaleString()} EGP
                                    </span>
                                    {product.cost && (
                                        <span className="text-lg md:text-lg font-bold text-gray-400 line-through mb-1">
                                            {(product.price * 1.25).toLocaleString()} EGP
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 mt-auto pb-6 md:pb-0">
                                {/* Quantity Counter */}
                                <div className={product.quantity <= 0 ? 'opacity-50 pointer-events-none' : ''}>
                                    <label className="text-sm font-bold text-gray-700 block mb-3 uppercase tracking-wider">Quantity</label>
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 w-fit rounded-2xl p-2 shadow-inner">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-lg transition-all active:scale-90"
                                        >
                                            <Minus size={16} strokeWidth={2.5} />
                                        </button>
                                        <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-lg transition-all active:scale-90"
                                        >
                                            <Plus size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    {product.quantity > 0 && product.quantity <= 10 && (
                                        <p className="text-secondary text-xs font-bold mt-2 animate-pulse">
                                            Only {product.quantity} left in stock!
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.quantity <= 0}
                                    className={`w-full py-4 rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${
                                        product.quantity > 0
                                            ? 'bg-primary text-white hover:bg-black shadow-primary/20 hover:shadow-primary/30'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <ShoppingCart size={22} strokeWidth={2.5} />
                                    {product.quantity > 0 
                                        ? `ADD TO CART • ${(product.price * quantity).toLocaleString()} EGP`
                                        : 'OUT OF STOCK'
                                    }
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
