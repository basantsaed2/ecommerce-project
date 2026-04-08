"use client";
import React, { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { Loader2, Package, ChevronRight, FileText, X, CheckCircle2, Clock, MapPin, CreditCard, Store, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersManager() {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // Fetch My Orders
    const { data: ordersData, isLoading: isFetchingOrders } = useGet<any>(
        ['orders'],
        '/order/my-orders'
    );
    const orders = ordersData?.data?.orders || ordersData?.orders || [];

    // Fetch Specific Order Detail when selected
    const { data: orderDetailData, isLoading: isFetchingDetail } = useGet<any>(
        ['order', selectedOrderId],
        `/order/${selectedOrderId}`,
        { enabled: !!selectedOrderId }
    );
    const orderDetails = orderDetailData?.data?.order || orderDetailData?.order;

    if (isFetchingOrders) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;
    }

    if (orders.length === 0) {
        return (
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                <Package className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-black text-xl mb-2">No Orders Yet</p>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">You haven't placed any orders. Start shopping to see your history here!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-black text-primary tracking-tight mb-6">Order History</h2>
            
            <div className="grid grid-cols-1 gap-4">
                {orders.map((order: any) => (
                    <div 
                        key={order._id} 
                        onClick={() => setSelectedOrderId(order._id)}
                        className="bg-white border-2 border-gray-100 rounded-[24px] p-6 cursor-pointer hover:border-secondary transition-all hover:shadow-xl hover:shadow-secondary/10 group flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="font-black text-primary text-lg">Order #{order._id.slice(-6).toUpperCase()}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 justify-between md:justify-end">
                            <div className="text-left md:text-right">
                                <p className="font-black text-secondary text-lg">{order.totalOrderPrice?.toLocaleString() || order.totalPrice?.toLocaleString() || order.totalAmount?.toLocaleString() || 0} EGP</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                        ['cancelled', 'rejected'].includes(order.status) ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {order.status === 'pending' && <Clock size={10} />}
                                        {order.status === 'delivered' && <CheckCircle2 size={10} />}
                                        {order.status || 'Processing'}
                                    </span>
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' :
                                        ['failed', 'unpaid'].includes(order.paymentStatus) ? 'bg-red-100 text-red-600' :
                                        'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {order.paymentStatus || 'Pending'}
                                    </span>
                                    {order.orderType === 'pickup' && order.warehouse && (
                                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-gray-100 text-gray-600 flex items-center gap-1">
                                            <Store size={10} /> {order.warehouse.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-secondary transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Details Modal Overlay */}
            {selectedOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
                        <button 
                            onClick={() => setSelectedOrderId(null)}
                            className="absolute top-6 right-6 w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="p-8 md:p-12">
                            {isFetchingDetail ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Loader2 className="animate-spin mb-4" size={40} />
                                    <p className="font-bold uppercase tracking-widest text-xs">Loading Details...</p>
                                </div>
                            ) : orderDetails ? (
                                <div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                            <FileText size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-primary">Order Details</h3>
                                            <p className="text-gray-400 font-bold tracking-widest text-xs uppercase mt-1">
                                                ID: {orderDetails._id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Products List */}
                                    <div className="space-y-4 mb-10">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Items</h4>
                                        {(orderDetails.cartItems || orderDetails.products || orderDetails.items || []).map((item: any) => {
                                            const isPopulated = item.product && typeof item.product === 'object';
                                            const productName = isPopulated ? (item.product.name || item.product.ar_name) : `Product ID: ${item.product}`;
                                            const productImage = isPopulated && item.product.image ? item.product.image : '/placeholder-product.png';

                                            return (
                                                <div key={item._id || (isPopulated ? item.product._id : item.product)} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl">
                                                    <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0">
                                                        <img src={productImage} alt="Product" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm line-clamp-1 text-primary">{productName}</p>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                                                    </div>
                                                    <div className="font-black text-secondary">
                                                        {(item.price * item.quantity).toLocaleString()} EGP
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Metadata */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl mb-8">
                                        <div>
                                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                {orderDetails.orderType === 'pickup' ? <Store size={12} /> : <MapPin size={12} />} 
                                                {orderDetails.orderType === 'pickup' ? 'Pickup Branch' : 'Shipping details'}
                                            </p>
                                            {orderDetails.orderType === 'pickup' ? (
                                                <div className="text-sm font-bold text-primary">
                                                    <p>{orderDetails.warehouse?.name || 'Unknown Branch'}</p>
                                                </div>
                                            ) : orderDetails.shippingAddress ? (
                                                <div className="text-sm font-bold text-primary">
                                                    <p>{orderDetails.shippingAddress.details || orderDetails.shippingAddress.street}</p>
                                                    <p className="text-gray-500 uppercase text-[10px] mt-1 font-black">
                                                        {orderDetails.shippingAddress.city && `${orderDetails.shippingAddress.city} • `} 
                                                        {orderDetails.shippingAddress.zone || ''}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-bold text-gray-500">Address info unavailable</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                                <CreditCard size={12} /> Payment
                                            </p>
                                            <div className="space-y-1">
                                                {orderDetails.paymentMethod ? (
                                                    <p className="text-sm font-bold text-primary uppercase inline-block mr-3">
                                                        {typeof orderDetails.paymentMethod === 'string' ? orderDetails.paymentMethod : orderDetails.paymentMethod.name || 'Manual'}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-500 inline-block mr-3">Not specified</p>
                                                )}
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block align-middle ${
                                                    orderDetails.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' :
                                                    ['failed'].includes(orderDetails.paymentStatus) ? 'bg-red-100 text-red-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {orderDetails.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                        <span className="text-lg font-black text-gray-400">Total Amount</span>
                                        <span className="text-3xl font-black text-primary">{(orderDetails.totalOrderPrice || orderDetails.totalPrice || orderDetails.totalAmount || 0).toLocaleString()} <span className="text-base text-gray-400">EGP</span></span>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <p className="font-bold">Failed to load order details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
