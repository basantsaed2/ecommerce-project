"use client";

import React, { useState } from 'react';
import { Search, Package, MapPin, Truck, CheckCircle, Clock, ShoppingBag, CreditCard, Calendar, Store } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

export default function OrderTrackingPage() {
    const [referenceId, setReferenceId] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!referenceId.trim()) {
            toast.error('Please enter an order reference');
            return;
        }

        setLoading(true);
        setOrderData(null);
        try {
            const response = await axiosInstance.get(`/order/status/${referenceId}`);
            // التعامل مع شكل الـ Data القادمة من الـ API
            const fetchedOrder = response.data.order || response.data.data?.order || response.data.data || response.data;
            setOrderData(fetchedOrder);
            toast.success('Order status retrieved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to track order. Please check your reference ID.');
        } finally {
            setLoading(false);
        }
    };

    // نظام المراحل الجمالي المتطور (Stepper)
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    
    const getCurrentStepIndex = (currentStatus: string) => {
        return steps.indexOf(currentStatus?.toLowerCase() || 'pending');
    };

    const getStatusTheme = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="text-amber-500" size={20} /> };
            case 'processing': return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Package className="text-blue-500" size={20} /> };
            case 'shipped': return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Truck className="text-purple-500" size={20} /> };
            case 'delivered': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="text-emerald-500" size={20} /> };
            default: return { bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Package className="text-gray-500" size={20} /> };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        Track Your Order
                    </h2>
                    <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
                        Enter your unique 8-digit order reference ID to check your order's journey and fulfillment status.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={referenceId}
                                onChange={(e) => setReferenceId(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3.5 text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-black transition-all text-base font-medium outline-none placeholder:text-slate-400"
                                placeholder="Enter Reference Number (e.g., 07208124)"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-900/10"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Tracking...
                                </span>
                            ) : 'Track Order'}
                        </button>
                    </form>
                </div>

                {/* Tracking Result Dashboard */}
                {orderData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Status Overview Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <span>Order Reference</span>
                                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px]">{orderData.orderType}</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{orderData.reference || referenceId}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                        <Calendar size={13} /> Placed on {orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-sm font-bold ${getStatusTheme(orderData.status).bg}`}>
                                    {getStatusTheme(orderData.status).icon}
                                    <span className="capitalize">{orderData.status}</span>
                                </div>
                            </div>

                            {/* Dynamic Live Description */}
                            {orderData.statusDescription && (
                                <div className="px-6 py-3 bg-amber-50/60 border-b border-slate-100 flex items-center gap-2 text-sm text-amber-800 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    Live Update: {orderData.statusDescription}
                                </div>
                            )}

                            {/* Visual Progress Stepper */}
                            <div className="p-6 sm:p-8 border-b border-slate-100">
                                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0">
                                    
                                    {/* Connection Line for Desktop */}
                                    <div className="absolute hidden sm:block top-[18px] left-[10%] right-[10%] h-[3px] bg-slate-100 -z-0">
                                        <div 
                                            className="h-full bg-slate-900 transition-all duration-1000"
                                            style={{ width: `${(getCurrentStepIndex(orderData.status) / (steps.length - 1)) * 100}%` }}
                                        />
                                    </div>

                                    {/* Step 1: Placed */}
                                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 z-10 bg-white sm:px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getCurrentStepIndex(orderData.status) >= 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            <Clock size={18} />
                                        </div>
                                        <div className="text-left sm:text-center">
                                            <p className="text-xs font-bold text-slate-900">Order Placed</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Processing */}
                                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 z-10 bg-white sm:px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getCurrentStepIndex(orderData.status) >= 1 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            <Package size={18} />
                                        </div>
                                        <div className="text-left sm:text-center">
                                            <p className="text-xs font-bold text-slate-900">Processing</p>
                                        </div>
                                    </div>

                                    {/* Step 3: Shipped / Ready */}
                                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 z-10 bg-white sm:px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getCurrentStepIndex(orderData.status) >= 2 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            {orderData.orderType === 'pickup' ? <Store size={18} /> : <Truck size={18} />}
                                        </div>
                                        <div className="text-left sm:text-center">
                                            <p className="text-xs font-bold text-slate-900">
                                                {orderData.orderType === 'pickup' ? 'Ready for Pickup' : 'Shipped Out'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4: Delivered */}
                                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 z-10 bg-white sm:px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getCurrentStepIndex(orderData.status) >= 3 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="text-left sm:text-center">
                                            <p className="text-xs font-bold text-slate-900">Completed</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Grid Context Info */}
                            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Left Side: Fulfillment Info (Dynamic Dependent on Order Type) */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        {orderData.orderType === 'pickup' ? <Store size={14} /> : <MapPin size={14} />} 
                                        {orderData.orderType === 'pickup' ? 'Pickup Location' : 'Shipping Address'}
                                    </h3>
                                    
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        {orderData.orderType === 'pickup' ? (
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold">Self-Pickup From Warehouse</p>
                                                <p className="text-slate-500 text-sm font-medium">Warehouse ID: {orderData.warehouse || 'Main Branch'}</p>
                                                <span className="inline-block mt-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg">
                                                    Bring Reference ID during pickup
                                                </span>
                                            </div>
                                        ) : orderData.shippingAddress ? (
                                            <p className="text-slate-700 font-medium text-sm leading-relaxed">
                                                {orderData.shippingAddress.street}<br />
                                                {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}<br />
                                                <span className="font-bold text-slate-900">{orderData.shippingAddress.country}</span>
                                            </p>
                                        ) : (
                                            <p className="text-slate-400 text-sm italic">No delivery address provided.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Payment Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard size={14} /> Payment & Billing
                                    </h3>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Gateway</span>
                                            <span className="text-slate-900 font-bold uppercase">{orderData.paymentGateway}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Payment Status</span>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${orderData.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {orderData.paymentStatus}
                                            </span>
                                        </div>
                                        <hr className="border-slate-200/60" />
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>Subtotal</span>
                                            <span>EGP {orderData.totalOrderPrice}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>Service Fee</span>
                                            <span>EGP {orderData.serviceFee || 0}</span>
                                        </div>
                                        {orderData.shippingPrice > 0 && (
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>Shipping</span>
                                                <span>EGP {orderData.shippingPrice}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-slate-900 font-black text-base pt-1">
                                            <span>Total Paid</span>
                                            <span>EGP {orderData.totalPriceAfterDiscount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Summary Card */}
                        {orderData.cartItems && orderData.cartItems.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <ShoppingBag size={14} /> Items Ordered ({orderData.cartItems.length})
                                </h3>
                                <div className="divide-y divide-slate-100">
                                    {orderData.cartItems.map((item: any, idx: number) => (
                                        <div key={item._id || idx} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900">Product ID: {item.product}</p>
                                                <p className="text-xs text-slate-400 font-medium">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-900">EGP {item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}