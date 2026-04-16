"use client";
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import { clearCartLocal, setCartState, setOrderType } from '@/store/slices/cartSlice';
import { MapPin, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Plus, Store, Truck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Address } from '@/types/address';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useQueryClient } from '@tanstack/react-query';

export default function CheckoutPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { items: reduxItems, totalCartPrice: reduxTotalPrice, orderType: reduxOrderType } = useSelector((state: RootState) => state.cart);
    const { token } = useSelector((state: RootState) => state.auth);

    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [selectedOrderType, setSelectedOrderType] = useState<string>(reduxOrderType);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [guestCountry, setGuestCountry] = useState('');
    const [guestCity, setGuestCity] = useState('');
    const [guestZone, setGuestZone] = useState('');
    const [guestStreet, setGuestStreet] = useState('');
    const [guestBuildingNumber, setGuestBuildingNumber] = useState('');
    const [guestFloorNumber, setGuestFloorNumber] = useState('');
    const [guestApartmentNumber, setGuestApartmentNumber] = useState('');
    const [guestLandmark, setGuestLandmark] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [proofFileName, setProofFileName] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Add Address Dialog state
    const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
    const [newAddrCountry, setNewAddrCountry] = useState('');
    const [newAddrCity, setNewAddrCity] = useState('');
    const [newAddrZone, setNewAddrZone] = useState('');
    const [newAddrStreet, setNewAddrStreet] = useState('');
    const [newAddrBuilding, setNewAddrBuilding] = useState('');
    const [newAddrFloor, setNewAddrFloor] = useState('');
    const [newAddrApartment, setNewAddrApartment] = useState('');
    const [newAddrLandmark, setNewAddrLandmark] = useState('');

    // Fetch directly from API
    const { data: cartResponse, isLoading: isFetchingCart } = useGet<any>(
        ['checkout-cart'],
        '/cart'
    );
    const backendCart = cartResponse?.data?.cart || cartResponse?.cart;
    const items = backendCart?.cartItems || reduxItems;
    const totalCartPrice = backendCart?.totalCartPrice ?? reduxTotalPrice ?? 0;
    const backendShippingCost = cartResponse?.data?.shippingCost || 0;
    const shippingCost = selectedOrderType === 'pickup' ? 0 : backendShippingCost;
    const finalTotal = totalCartPrice + shippingCost;

    // Sync API data with Redux
    useEffect(() => {
        if (cartResponse && backendCart) {
            dispatch(setCartState(backendCart));
        }
    }, [cartResponse, backendCart, dispatch]);

    // Redirect empty cart
    useEffect(() => {
        if (!isFetchingCart && items.length === 0 && !isSuccess) {
            router.push('/cart');
        }
    }, [items.length, router, isSuccess, isFetchingCart]);

    // Fetch addresses
    const { data: addressesData, isLoading: isFetchingAddresses } = useGet<any>(
        ['addresses'],
        '/address',
        { enabled: !!token }
    );
    const addresses: Address[] = addressesData?.data?.addresses || addressesData?.addresses || [];

    // Fetch address lists for guest
    const { data: listsData } = useGet<any>(
        ['address-lists'],
        '/address/lists'
    );
    const lists: any = listsData?.data || listsData || { countries: [], cities: [], zones: [] };
    const filteredCities = lists.cities?.filter((c: any) => c.country === guestCountry || !c.country) || [];
    const filteredZones = lists.zones?.filter((z: any) => z.cityId === guestCity || !z.cityId) || [];

    // Fetch payment methods
    const { data: pmData, isLoading: isFetchingPm } = useGet<any>(
        ['payment-methods'],
        '/payment-methods'
    );
    const paymentMethodsList = Array.isArray(pmData?.data?.data)
        ? pmData.data.data
        : Array.isArray(pmData?.data) ? pmData.data : [];

    // Fetch order types
    const { data: otData, isLoading: isFetchingOt } = useGet<any>(
        ['order-types'],
        '/order-type'
    );
    const orderTypesList = Array.isArray(otData?.data?.data)
        ? otData.data.data
        : Array.isArray(otData?.data) ? otData.data : [];

    // Fetch warehouses
    const { data: wData, isLoading: isFetchingW } = useGet<any>(
        ['warehouses'],
        '/warehouse'
    );
    const warehousesList = Array.isArray(wData?.data?.data)
        ? wData.data.data
        : Array.isArray(wData?.data) ? wData.data : [];

    // Auto-select first address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0]._id);
        }
    }, [addresses, selectedAddress]);

    // Auto-select first payment method
    useEffect(() => {
        if (paymentMethodsList.length > 0 && !paymentMethod) {
            const firstMethod = paymentMethodsList[0];
            const firstValue = typeof firstMethod === 'string' ? firstMethod : (firstMethod._id || firstMethod.name || firstMethod.id);
            if (firstValue) setPaymentMethod(firstValue);
        }
    }, [paymentMethodsList, paymentMethod]);

    // Auto-select first order type
    useEffect(() => {
        if (orderTypesList.length > 0 && !selectedOrderType) {
            const deliveryType = orderTypesList.find((t: any) => t.type === 'delivery');
            setSelectedOrderType(deliveryType ? deliveryType.type : orderTypesList[0].type);
        }
    }, [orderTypesList, selectedOrderType]);

    // Auto-select warehouse
    useEffect(() => {
        if (warehousesList.length > 0 && !selectedWarehouse) {
            setSelectedWarehouse(warehousesList[0]._id);
        }
    }, [warehousesList, selectedWarehouse]);

    // Checkout Mutation
    const { mutate: placeOrder, isPending: isPlacingOrder } = usePost(
        '/order/checkout',
        ['cart', 'orders'],
        'Order placed successfully!'
    );

    // Add Address Mutation
    const { mutate: addAddress, isPending: isAddingAddress } = usePost(
        '/address',
        ['addresses'],
        'Address added successfully!'
    );

    const handleAddAddress = () => {
        if (!newAddrCountry || !newAddrCity || !newAddrZone || !newAddrStreet || !newAddrBuilding) {
            toast.error('Please fill in all required fields (Country, City, Zone, Street, Building)');
            return;
        }
        addAddress({
            country: newAddrCountry,
            city: newAddrCity,
            zone: newAddrZone,
            street: newAddrStreet,
            buildingNumber: newAddrBuilding,
            floorNumber: newAddrFloor || undefined,
            apartmentNumber: newAddrApartment || undefined,
            uniqueIdentifier: newAddrLandmark || undefined,
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['addresses'] });
                setShowAddAddressDialog(false);
                setNewAddrCountry(''); setNewAddrCity(''); setNewAddrZone('');
                setNewAddrStreet(''); setNewAddrBuilding(''); setNewAddrFloor('');
                setNewAddrApartment(''); setNewAddrLandmark('');
            }
        });
    };

    const handleCheckout = () => {
        if (selectedOrderType === 'pickup') {
            if (!selectedWarehouse) {
                toast.error("Please select a pick up branch");
                return;
            }
        } else {
            if (!token && (!guestCountry || !guestCity || !guestZone || !guestStreet || !guestBuildingNumber)) {
                toast.error("Please fill in all required delivery details (Country, City, Zone, Street, Building)");
                return;
            }

            if (token && !selectedAddress) {
                toast.error("Please select a shipping address");
                return;
            }
        }

        const payload: any = {
            orderType: selectedOrderType,
            paymentMethod: paymentMethod
        };

        if (selectedOrderType === 'pickup') {
            payload.warehouseId = selectedWarehouse;
        } else {
            payload.shippingAddress = token ? selectedAddress : { 
                country: guestCountry, 
                city: guestCity, 
                zone: guestZone, 
                street: guestStreet,
                buildingNumber: guestBuildingNumber,
                floorNumber: guestFloorNumber,
                apartmentNumber: guestApartmentNumber,
                uniqueIdentifier: guestLandmark
            };
        }

        if (proofImage) {
            payload.proofImage = proofImage;
        }

        placeOrder(payload, {
            onSuccess: (res: any) => {
                const iframeUrl = res?.iframeUrl || res?.data?.iframeUrl || res?.data?.payment?.iframeUrl || res?.payment?.iframeUrl || res?.data?.order?.payment?.iframeUrl;
                
                dispatch(clearCartLocal());

                if (iframeUrl) {
                    window.location.href = iframeUrl;
                } else {
                    setIsSuccess(true);
                }
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="w-full px-4 md:px-12 min-h-[70vh] flex flex-col items-center justify-center text-center py-20">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-4xl font-black text-primary tracking-tighter mb-4">Order Confirmed!</h1>
                <p className="text-gray-500 font-medium max-w-sm mb-8">
                    Your order has been successfully placed. We'll send you an email with your shipping details shortly.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/profile')}
                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                        View Orders
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-primary/20"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    if (isFetchingCart && items.length === 0) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
                <p className="text-gray-500 font-bold">Loading secure checkout...</p>
            </div>
        );
    }

    if (items.length === 0 && !isSuccess) return null;

    return (
        <div className="w-full px-4 md:px-12 py-6 pb-24">
            <h1 className="text-4xl font-black text-primary tracking-tight mb-10">Secure Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    {/* Order Type Selection */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">1</div>
                            <h2 className="text-2xl font-black text-primary">Order Type</h2>
                        </div>
                        {isFetchingOt ? (
                            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : orderTypesList.length === 0 ? (
                            <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center">
                                <p className="text-gray-400 font-medium">No order types available.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {orderTypesList.map((ot: any) => {
                                    const typeName = ot.type;
                                    const isPickup = typeName === 'pickup';
                                    return (
                                        <div
                                            key={ot._id}
                                            onClick={() => {
                                                setSelectedOrderType(typeName);
                                                dispatch(setOrderType(typeName as 'delivery' | 'pickup'));
                                            }}
                                            className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-center gap-5 ${selectedOrderType === typeName ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-gray-100 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedOrderType === typeName ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                {isPickup ? <Store size={28} /> : <Truck size={28} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-lg capitalize">{typeName}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    {isPickup ? 'Pick up from branch' : 'Deliver to your door'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Address / Branch Selection */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">2</div>
                            <h2 className="text-2xl font-black text-primary">
                                {selectedOrderType === 'pickup' ? 'Select Branch' : 'Shipping Address'}
                            </h2>
                        </div>

                        {selectedOrderType === 'pickup' ? (
                            isFetchingW ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : warehousesList.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                                    <Store className="mx-auto text-gray-300 mb-4" size={40} />
                                    <p className="text-gray-500 font-black text-lg mb-2">No Branches Available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {warehousesList.map((wh: any) => (
                                        <div
                                            key={wh._id}
                                            onClick={() => setSelectedWarehouse(wh._id)}
                                            className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all ${selectedWarehouse === wh._id
                                                ? 'border-secondary bg-secondary/5 shadow-xl shadow-secondary/10'
                                                : 'border-gray-100 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedWarehouse === wh._id ? 'border-secondary' : 'border-gray-300'}`}>
                                                    <div className={`w-3 h-3 rounded-full transition-transform ${selectedWarehouse === wh._id ? 'bg-secondary scale-100' : 'scale-0'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-primary text-lg">{wh.name || 'Branch'}</p>
                                                    <p className="text-sm font-bold text-gray-500 mt-1">{wh.address || 'No address'}</p>
                                                    {wh.phone && (
                                                        <div className="mt-3 flex gap-2 flex-wrap">
                                                            <span className="px-2.5 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-lg">
                                                                📞 {wh.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : !token ? (
                            <div className="bg-gray-50/50 p-6 sm:p-8 rounded-[32px] border-2 border-gray-100 mb-6">
                                <h3 className="text-2xl font-black text-primary mb-6">Delivery Details</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Country"
                                            options={lists.countries || []}
                                            value={guestCountry}
                                            onChange={(val) => { setGuestCountry(val); setGuestCity(''); setGuestZone(''); }}
                                            placeholder="Pick Country"
                                        />
                                        <SearchableSelect
                                            label="City"
                                            options={filteredCities}
                                            value={guestCity}
                                            onChange={(val) => { setGuestCity(val); setGuestZone(''); }}
                                            placeholder="Pick City"
                                            disabled={!guestCountry}
                                        />
                                        <SearchableSelect
                                            label="Zone"
                                            options={filteredZones}
                                            value={guestZone}
                                            onChange={(val) => setGuestZone(val)}
                                            placeholder="Pick Zone"
                                            disabled={!guestCity}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Name</label>
                                            <input type="text" placeholder="e.g. Al-Hamra St." value={guestStreet} onChange={(e) => setGuestStreet(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Building Number</label>
                                            <input type="text" placeholder="e.g. 42" value={guestBuildingNumber} onChange={(e) => setGuestBuildingNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor</label>
                                            <input type="number" placeholder="e.g. 12" value={guestFloorNumber} onChange={(e) => setGuestFloorNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apartment</label>
                                            <input type="number" placeholder="e.g. 1" value={guestApartmentNumber} onChange={(e) => setGuestApartmentNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                            <input type="text" placeholder="e.g. Near Mosque" value={guestLandmark} onChange={(e) => setGuestLandmark(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : isFetchingAddresses ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : addresses.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                                <MapPin className="mx-auto text-gray-300 mb-4" size={40} />
                                <p className="text-gray-500 font-black text-lg mb-2">No Saved Addresses</p>
                                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">You need a delivery address to complete your checkout.</p>
                                <button
                                    onClick={() => setShowAddAddressDialog(true)}
                                    className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18} /> Add New Address
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddress(addr._id)}
                                        className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all ${selectedAddress === addr._id
                                            ? 'border-secondary bg-secondary/5 shadow-xl shadow-secondary/10'
                                            : 'border-gray-100 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddress === addr._id ? 'border-secondary' : 'border-gray-300'}`}>
                                                <div className={`w-3 h-3 rounded-full transition-transform ${selectedAddress === addr._id ? 'bg-secondary scale-100' : 'scale-0'}`} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-lg">{addr.street}</p>
                                                <p className="text-sm font-bold text-gray-500 mt-1">Bldg {addr.buildingNumber}{addr.apartmentNumber ? `, Apt ${addr.apartmentNumber}` : ''}</p>
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    <span className="px-2.5 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-lg">
                                                        {addr.city?.name || 'City'}
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-lg">
                                                        {addr.zone?.name || 'Zone'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Add New Address card */}
                                <div
                                    onClick={() => setShowAddAddressDialog(true)}
                                    className="p-6 rounded-[24px] border-2 border-dashed border-gray-200 cursor-pointer transition-all hover:border-secondary hover:bg-secondary/5 flex flex-col items-center justify-center min-h-[140px] group"
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-secondary flex items-center justify-center mb-3 transition-colors">
                                        <Plus className="text-gray-400 group-hover:text-secondary w-6 h-6 transition-colors" />
                                    </div>
                                    <p className="font-bold text-gray-500 text-sm group-hover:text-secondary transition-colors">Add New Address</p>
                                </div>
                            </div>
                        )}

                        {/* ── Add Address Dialog ── */}
                        {showAddAddressDialog && (
                            <div
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                                onClick={() => setShowAddAddressDialog(false)}
                            >
                                <div
                                    className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Dialog Header */}
                                    <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                                                <MapPin size={20} />
                                            </div>
                                            <h2 className="text-xl font-black text-primary">Add New Address</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowAddAddressDialog(false)}
                                            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all border border-gray-100"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Dialog Body */}
                                    <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <SearchableSelect
                                                label="Country *"
                                                options={lists.countries || []}
                                                value={newAddrCountry}
                                                onChange={(val) => { setNewAddrCountry(val); setNewAddrCity(''); setNewAddrZone(''); }}
                                                placeholder="Select Country"
                                            />
                                            <SearchableSelect
                                                label="City *"
                                                options={(lists.cities || []).filter((c: any) => c.country === newAddrCountry || !c.country)}
                                                value={newAddrCity}
                                                onChange={(val) => { setNewAddrCity(val); setNewAddrZone(''); }}
                                                placeholder="Select City"
                                                disabled={!newAddrCountry}
                                            />
                                            <div className="sm:col-span-2">
                                                <SearchableSelect
                                                    label="Zone *"
                                                    options={(lists.zones || []).filter((z: any) => z.cityId === newAddrCity || !z.cityId)}
                                                    value={newAddrZone}
                                                    onChange={(val) => setNewAddrZone(val)}
                                                    placeholder="Select Zone"
                                                    disabled={!newAddrCity}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Al-Hamra St."
                                                value={newAddrStreet}
                                                onChange={e => setNewAddrStreet(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Building No. *</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 42"
                                                    value={newAddrBuilding}
                                                    onChange={e => setNewAddrBuilding(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 3"
                                                    value={newAddrFloor}
                                                    onChange={e => setNewAddrFloor(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apartment</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 1"
                                                    value={newAddrApartment}
                                                    onChange={e => setNewAddrApartment(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Near Mosque"
                                                    value={newAddrLandmark}
                                                    onChange={e => setNewAddrLandmark(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dialog Footer */}
                                    <div className="flex gap-3 px-8 pb-8 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setShowAddAddressDialog(false)}
                                            className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddAddress}
                                            disabled={isAddingAddress}
                                            className="flex-1 py-3 rounded-xl font-black text-white bg-secondary hover:bg-primary transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {isAddingAddress ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                            {isAddingAddress ? 'Saving...' : 'Save Address'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Payment Method */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">3</div>
                            <h2 className="text-2xl font-black text-primary">Payment Method</h2>
                        </div>

                        {isFetchingPm ? (
                            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : paymentMethodsList.length === 0 ? (
                            <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center">
                                <p className="text-gray-400 font-medium">No payment methods available.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paymentMethodsList.map((methodObj: any, idx: number) => {
                                    const methodIdentifier = methodObj._id || methodObj.name || methodObj.id || methodObj;
                                    const methodName = methodObj.name || methodObj.title || methodObj.method || "Unknown";
                                    const methodLogo = methodObj.logo || methodObj.icon;
                                    const methodDesc = methodObj.description || methodObj.discription;
                                    const isCash = methodName?.toLowerCase() === 'cash' || String(methodIdentifier).toLowerCase() === 'cash';

                                    return (
                                        <div
                                            key={methodIdentifier || idx}
                                            onClick={() => setPaymentMethod(methodIdentifier)}
                                            className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-center gap-5 ${paymentMethod === methodIdentifier ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-gray-100 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === methodIdentifier ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                {methodLogo ? (
                                                    <img src={methodLogo} alt={methodName} className="w-8 h-8 object-contain" />
                                                ) : isCash ? (
                                                    <Banknote size={28} />
                                                ) : (
                                                    <CreditCard size={28} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-lg capitalize">{isCash ? 'Cash on Delivery' : methodName}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    {methodDesc || (isCash ? 'Pay when received' : 'Pay securely online')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {paymentMethod && (
                            <div className="mt-6 p-6 rounded-[24px] border-2 border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-black text-primary mb-2">Payment Proof</h3>
                                <p className="text-sm font-bold text-gray-500 mb-4">
                                    If you are using a manual payment method (e.g., Vodafone Cash, Bank Transfer), please upload a screenshot of the receipt.
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setProofFileName(file.name);

                                            // Convert to base64
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProofImage(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-3 file:px-6
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-bold
                                        file:bg-primary file:text-white
                                        hover:file:bg-black transition-all cursor-pointer"
                                />
                                {proofFileName && (
                                    <p className="mt-3 text-sm font-bold text-green-600 flex items-center gap-2">
                                        <CheckCircle2 size={16} /> Attached: {proofFileName}
                                    </p>
                                )}
                            </div>
                        )}

                    </section>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-primary text-white rounded-[40px] p-8 md:p-10 sticky top-32 shadow-2xl shadow-primary/30">
                        <h2 className="text-2xl font-black mb-8 italic tracking-tighter">Order Summary</h2>

                        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item: any) => (
                                <div key={item.product._id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0">
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm line-clamp-1">{item.product.name || item.product.ar_name}</p>
                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                                    </div>
                                    <div className="font-black text-secondary">
                                        {(item.price * item.quantity).toLocaleString()} EGP
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center text-white/70">
                                <span className="font-bold text-sm uppercase tracking-wider">Subtotal</span>
                                <span className="font-black text-lg text-white">{totalCartPrice.toLocaleString()} EGP</span>
                            </div>
                            <div className="flex justify-between items-center text-white/50">
                                <span className="font-bold text-sm uppercase tracking-wider">Shipping</span>
                                {shippingCost > 0 ? (
                                    <span className="font-black text-lg text-white">{shippingCost} EGP</span>
                                ) : (
                                    <span className="font-black text-[10px] text-white uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">
                                        {selectedOrderType === 'pickup' ? 'FREE' : (!token ? 'Calculated at checkout' : 'FREE')}
                                    </span>
                                )}
                            </div>
                            <div className="pt-6 flex justify-between items-center border-t border-white/10">
                                <span className="text-xl font-black italic">Total</span>
                                <span className="text-3xl font-black tracking-tight text-white">{finalTotal.toLocaleString()} <span className="text-base text-white/50">EGP</span></span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isPlacingOrder || (selectedOrderType === 'pickup' ? !selectedWarehouse : (token ? !selectedAddress : (!guestCountry || !guestCity || !guestZone || !guestStreet || !guestBuildingNumber)))}
                            className="w-full bg-secondary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white hover:text-secondary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-secondary/20 border-2 border-secondary hover:border-white"
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Confirm Order <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-3 text-white/40 bg-white/5 py-4 rounded-2xl border border-white/5">
                            <ShieldCheck size={20} className="text-green-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
