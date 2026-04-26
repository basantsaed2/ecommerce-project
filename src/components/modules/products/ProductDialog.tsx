"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse } from '@/types/api';
import { Loader2, X, Plus, Minus, ShoppingCart, Zap } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProductDialogProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDialog({ productId, isOpen, onClose }: ProductDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.token);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const { data, isLoading, error } = useGet<SingleApiResponse<Product>>(
        ['product', productId],
        `/product/${productId}`,
        { enabled: isOpen }
    );

    if (!isOpen) return null;

    const product = data?.data?.data;

    // Group variations and options
    const { variationsMap, variationNames } = useMemo(() => {
        const vMap: Record<string, string[]> = {};
        if (product?.prices) {
            product.prices.forEach(p => {
                p.variations.forEach(v => {
                    const vName = v.name;
                    if (!vMap[vName]) {
                        vMap[vName] = [];
                    }
                    v.options.forEach(opt => {
                        if (!vMap[vName].includes(opt.name)) {
                            vMap[vName].push(opt.name);
                        }
                    });
                });
            });
        }
        return { variationsMap: vMap, variationNames: Object.keys(vMap) };
    }, [product]);

    // Initialize selected options
    useEffect(() => {
        if (product && variationNames.length > 0 && Object.keys(selectedOptions).length === 0) {
            // Find first price object with stock
            const inStockPrice = product.prices?.find(p => p.quantity > 0);
            const initialOptions: Record<string, string> = {};

            if (inStockPrice) {
                inStockPrice.variations.forEach(v => {
                    initialOptions[v.name] = v.options[0].name;
                });
            } else {
                variationNames.forEach(name => {
                    initialOptions[name] = variationsMap[name][0];
                });
            }
            setSelectedOptions(initialOptions);
        }
    }, [product, variationNames, variationsMap, selectedOptions]);

    // Find the current selected price object
    const currentPriceObj = useMemo(() => {
        return product?.prices?.find(p => {
            return variationNames.every(vName => {
                return p.variations.some(v => v.name === vName && v.options.some(opt => opt.name === selectedOptions[vName]));
            });
        });
    }, [product, variationNames, selectedOptions]);

    const displayPrice = currentPriceObj ? currentPriceObj.price : (product?.main_price || product?.price || 0);
    const displayPriceAfterDiscount = currentPriceObj?.price_after_discount;
    const isOutOfStock = currentPriceObj ? currentPriceObj.quantity <= 0 : (product?.quantity || 0) <= 0;

    // Check if an option exists in any price object
    const optionExists = (vName: string, oName: string) => {
        if (!product?.prices) return true;
        return product.prices.some(p => {
            return p.variations.some(v => v.name === vName && v.options.some(opt => opt.name === oName));
        });
    };

    // Check if an option is specifically out of stock for the current selection
    const isOptionInStock = (vName: string, oName: string) => {
        if (!product?.prices) return true;
        return product.prices.some(p => {
            if (p.quantity <= 0) return false;
            const matchesOption = p.variations.some(v => v.name === vName && v.options.some(opt => opt.name === oName));
            if (!matchesOption) return false;
            return variationNames.every(otherVName => {
                if (otherVName === vName) return true;
                return p.variations.some(v => v.name === otherVName && v.options.some(opt => opt.name === selectedOptions[otherVName]));
            });
        });
    };

    const handleAddToCart = () => {
        if (!product) return;

        if (isOutOfStock) {
            toast.error('This combination is currently sold out');
            return;
        }

        dispatch(addItem({
            product: product,
            variant: currentPriceObj || undefined,
            quantity: quantity
        }));

        dispatch(syncCart());
        toast.success(`Added to cart`);
        onClose();
    };

    const handleBuyNow = async () => {
        if (!product) return;

        if (isOutOfStock) {
            toast.error('This combination is currently sold out');
            return;
        }

        setIsBuyingNow(true);
        dispatch(addItem({
            product: product,
            variant: currentPriceObj || undefined,
            quantity: quantity
        }));
        
        await dispatch(syncCart());
        setIsBuyingNow(false);
        onClose();
        router.push('/cart');
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
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
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 transition-all overflow-hidden bg-white p-1 ${(selectedImage === img || (!selectedImage && img === product.image))
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
                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between md:overflow-y-auto">
                            <div>
                                {product.is_featured && (
                                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                        Featured Item
                                    </span>
                                )}
                                <h1 className="text-2xl md:text-3xl font-black text-primary mb-3 leading-tight">
                                    {product.name || product.ar_name}
                                </h1>

                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    {product.description || product.ar_description || "No description provided for this product. High quality and verified."}
                                </p>

                                <div className="flex items-end gap-3 mb-8">
                                    <span className="text-4xl font-black text-secondary">
                                        {(displayPriceAfterDiscount || displayPrice)?.toLocaleString()} EGP
                                    </span>
                                    {(displayPriceAfterDiscount && displayPrice) && (
                                        <span className="text-lg font-bold text-gray-400 line-through mb-1">
                                            {displayPrice.toLocaleString()} EGP
                                        </span>
                                    )}
                                </div>

                                {/* Variations Section */}
                                {variationNames.length > 0 && (
                                    <div className="space-y-6 mb-8">
                                        {variationNames.map(vName => (
                                            <div key={vName}>
                                                <label className="text-sm font-bold text-gray-700 block mb-3 uppercase tracking-wider">
                                                    {vName}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {variationsMap[vName].map(oName => {
                                                        const inStock = isOptionInStock(vName, oName);
                                                        const isSelected = selectedOptions[vName] === oName;
                                                        return (
                                                            <button
                                                                key={oName}
                                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [vName]: oName }))}
                                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex flex-col items-center ${isSelected
                                                                    ? 'bg-secondary border-secondary text-white shadow-md'
                                                                    : !inStock
                                                                        ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-70'
                                                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                <span>{oName}</span>
                                                                {!inStock && <span className="text-[10px] opacity-70">Sold Out</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 mt-auto pb-6 md:pb-0">
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

                                {/* Buttons Row */}
                                <div className="flex flex-col gap-3">
                                    {/* Add to Cart */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        className={`w-full py-4 rounded-[1.25rem] font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] border-2 ${!isOutOfStock
                                            ? 'bg-white text-primary border-primary hover:bg-primary hover:text-white hover:shadow-primary/20'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100 shadow-none'
                                            }`}
                                    >
                                        <ShoppingCart size={20} strokeWidth={2.5} />
                                        {!isOutOfStock
                                            ? `ADD TO CART • ${((displayPriceAfterDiscount || displayPrice || 0) * quantity).toLocaleString()} EGP`
                                            : 'OUT OF STOCK'
                                        }
                                    </button>

                                    {/* Buy Now */}
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={isOutOfStock || isBuyingNow}
                                        className={`w-full py-4 rounded-[1.25rem] font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${!isOutOfStock
                                            ? 'bg-secondary text-white hover:bg-primary shadow-secondary/20 hover:shadow-primary/30'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                            }`}
                                    >
                                        {isBuyingNow
                                            ? <Loader2 size={20} className="animate-spin" />
                                            : <Zap size={20} strokeWidth={2.5} />
                                        }
                                        {isBuyingNow ? 'Processing...' : (isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
