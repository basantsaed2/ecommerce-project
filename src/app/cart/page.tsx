"use client";
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
    updateQuantity,
    removeItem,
    clearCartSync,
    clearCartLocal,
    setCartState,
    setOrderType,
    applyCoupon,
    removeCoupon,
    syncCart
} from '@/store/slices/cartSlice';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingBasket, Loader2, Store, Truck, Ticket, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { 
        items, 
        totalCartPrice, 
        shippingCost, 
        couponDiscount,
        taxAmount,
        serviceFee,
        orderType,
        loading: isLoading 
    } = useSelector((state: RootState) => state.cart);
    
    const { token } = useSelector((state: RootState) => state.auth);
    const [mounted, setMounted] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial fetch to sync with server if needed
        dispatch(syncCart());
    }, [dispatch]);

    // Handle window close or visibility change to sync
    useEffect(() => {
        const handleSync = () => {
            dispatch(syncCart());
        };
        window.addEventListener('beforeunload', handleSync);
        return () => window.removeEventListener('beforeunload', handleSync);
    }, [dispatch]);

    if (!mounted) return null;

    const currentShippingCost = orderType === 'pickup' ? 0 : (shippingCost || 0);
    const finalTotal = totalCartPrice + currentShippingCost + (taxAmount || 0) + (serviceFee || 0) - (couponDiscount || 0);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        const result = await dispatch(applyCoupon(couponCode));
        if (applyCoupon.fulfilled.match(result)) {
            setCouponCode('');
        }
        setIsApplyingCoupon(false);
    };

    const handleRemoveCoupon = async () => {
        setIsApplyingCoupon(true);
        await dispatch(removeCoupon());
        setIsApplyingCoupon(false);
    };

    const handleUpdateQuantity = async (productId: string, variantId: string | undefined, newQty: number) => {
        if (newQty < 1) return;
        dispatch(updateQuantity({ productId, variantId, quantity: newQty }));
        dispatch(syncCart());
    };

    const handleRemove = async (productId: string, variantId?: string) => {
        dispatch(removeItem({ productId, variantId }));
        dispatch(syncCart());
    };

    const handleClear = () => {
        dispatch(clearCartSync());
    };

    const handleCheckout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await dispatch(syncCart());
        router.push('/checkout');
    };

    if (isLoading && items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
                <p className="text-gray-500 font-bold">Loading your cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <ShoppingBasket size={48} className="text-gray-300" />
                </div>
                <h1 className="text-3xl font-black text-primary mb-2">Your cart is empty</h1>
                <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Go ahead and explore our latest collections!</p>
                <Link
                    href="/categories"
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                    Start Shopping <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full px-4 md:px-12 py-6">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight">Shopping Cart</h1>
                    <p className="text-gray-500 mt-1">You have {items.length} items in your cart</p>
                </div>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                >
                    <Trash2 size={16} /> Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item: any) => (
                        <div key={`${item.product._id}-${item.variant?._id || 'no-variant'}`} className="group flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 relative">
                            {/* Product Image */}
                            <div className="w-32 h-32 bg-gray-50 rounded-2xl p-4 flex items-center justify-center shrink-0">
                                <img
                                    src={item.product?.image || '/placeholder-product.png'}
                                    alt={item.product?.name || 'Product'}
                                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-black text-primary mb-1 line-clamp-1">
                                    {item.product?.name || item.product?.ar_name || `Product (${item.product?._id?.slice(-4) || 'Unknown'})`}
                                </h3>
                                <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">
                                    Price: {item.price.toLocaleString()} EGP
                                </p>

                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-1.5">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product._id, item.variant?._id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-secondary hover:shadow-sm transition-all"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center font-black text-primary">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product._id, item.variant?._id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-secondary hover:shadow-sm transition-all"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.product._id, item.variant?._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right sm:border-l border-gray-50 sm:pl-8 min-w-[120px]">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subtotal</p>
                                <p className="text-xl font-black text-secondary">
                                    {(item.price * item.quantity).toLocaleString()} EGP
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-primary text-white rounded-[40px] p-10 sticky top-32 shadow-2xl shadow-primary/30">
                        <h2 className="text-2xl font-black mb-8 italic tracking-tighter">Order Summary</h2>

                        {/* Order Type Selection in Cart */}
                        <div className="mb-8 p-1 bg-white/10 rounded-2xl flex">
                            <button
                                onClick={() => dispatch(setOrderType('delivery'))}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${orderType === 'delivery' ? 'bg-secondary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                            >
                                <Truck size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">Delivery</span>
                            </button>
                            <button
                                onClick={() => dispatch(setOrderType('pickup'))}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${orderType === 'pickup' ? 'bg-secondary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                            >
                                <Store size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">Pickup</span>
                            </button>
                        </div>

                        {/* Coupon Section */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-3">Have a coupon?</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={isApplyingCoupon || !couponCode}
                                    className="bg-white text-primary px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center text-white/70">
                                <span className="font-bold text-sm">Items Subtotal</span>
                                <span className="font-black text-base">{totalCartPrice.toLocaleString()} EGP</span>
                            </div>
                            
                            {taxAmount > 0 && (
                                <div className="flex justify-between items-center text-white/70">
                                    <span className="font-bold text-sm">Tax</span>
                                    <span className="font-black text-base">{taxAmount.toLocaleString()} EGP</span>
                                </div>
                            )}

                            {serviceFee > 0 && (
                                <div className="flex justify-between items-center text-white/70">
                                    <span className="font-bold text-sm">Service Fees</span>
                                    <span className="font-black text-base">{serviceFee.toLocaleString()} EGP</span>
                                </div>
                            )}

                            <div className="flex gap-2 justify-between items-center text-white/70">
                                <span className="font-bold text-sm">Shipping</span>
                                <span className="font-black text-sm text-secondary uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">
                                    {orderType === 'pickup' ? 'FREE' : (shippingCost === 0 ? (!token ? 'Calculated' : 'FREE') : `${shippingCost} EGP`)}
                                </span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-secondary-foreground bg-green-500/20 p-3 rounded-2xl border border-green-500/30">
                                    <div className="flex items-center gap-2">
                                        <Percent size={14} className="text-green-400" />
                                        <div className="flex flex-col">
                                            <span className="font-black text-xs uppercase tracking-wider text-green-400">Coupon Discount</span>
                                            <button 
                                                onClick={handleRemoveCoupon}
                                                className="text-[9px] font-bold text-green-400/50 hover:text-green-400 underline underline-offset-2 text-left transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <span className="font-black text-base text-green-400">-{couponDiscount.toLocaleString()} EGP</span>
                                </div>
                            )}

                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <span className="text-xl font-black italic">Grand Total</span>
                                <span className="text-3xl font-black tracking-tight">{finalTotal.toLocaleString()} EGP</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-secondary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white hover:text-secondary transition-all active:scale-[0.98] shadow-xl shadow-black/10"
                        >
                            Checkout Now <ArrowRight size={20} />
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-4 text-white/50">
                            <ShoppingBag size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
