"use client";
import React, { useState } from 'react';
import { Product } from '@/types/api';
import { ShoppingCart, Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import ProductDialog from './ProductDialog';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useDispatch();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the dialog when clicking the cart button
        dispatch(addToCart({
            id: product._id,
            name: product.name || product.ar_name || 'Unknown',
            price: product.price,
            quantity: 1,
            image: product.image
        }));
        toast.success(`Added ${product.name} to cart`);
    };

    return (
        <>
            <div 
                onClick={() => setIsDialogOpen(true)}
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden relative cursor-pointer"
            >
                {/* Tags */}
                {product.is_featured && (
                    <div className="absolute top-4 left-4 z-10 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        Hot
                    </div>
                )}
                
                <div 
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); toast.success('Added to wishlist'); }}
                >
                    <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                    </button>
                </div>

                {/* Image */}
                <div className="relative h-48 sm:h-56 bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-50">
                    <img 
                        src={product.image} 
                        alt={product.name || product.ar_name} 
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80';
                        }}
                    />
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 flex flex-col flex-1 bg-gray-50/50">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-secondary transition-colors" title={product.name || product.ar_name}>
                            {product.name || product.ar_name}
                        </h3>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-2 line-clamp-1">
                            Product
                        </p>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Price</p>
                            <p className="font-black text-lg text-primary">
                                ${product.price?.toLocaleString()} 
                                {product.cost && <span className="text-xs font-bold text-gray-400 line-through ml-1">${(product.price * 1.2).toLocaleString()}</span>}
                            </p>
                        </div>
                        <button 
                            onClick={handleAddToCart}
                            className="bg-primary text-white p-2.5 md:p-3 rounded-2xl hover:bg-secondary hover:shadow-lg hover:shadow-secondary/30 transition-all active:scale-95 z-20"
                        >
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Render the Details Dialog conditionally */}
            {isDialogOpen && (
                <ProductDialog 
                    productId={product._id} 
                    isOpen={isDialogOpen} 
                    onClose={() => setIsDialogOpen(false)} 
                />
            )}
        </>
    );
}
