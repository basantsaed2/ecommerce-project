"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import { clearCartLocal, setCartState, setOrderType } from '@/store/slices/cartSlice';
import { MapPin, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Plus, Store, Truck, X, Percent, CalendarClock, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { Address } from '@/types/address';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { useQueryClient } from '@tanstack/react-query';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import StoreLoader from '@/components/common/StoreLoader';
import { useTranslation } from '@/hooks/useTranslation';
import { getCartItemVariations } from '@/utils/cartUtils';

interface BostaCityOption {
    _id: string;
    name: string;
}

interface BostaDistrictOption {
    _id: string;
    name: string;
    zoneId: string;
    zoneName: string;
    districtId: string;
    districtName: string;
}

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | undefined =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value as ApiRecord
        : undefined;

const asString = (...values: unknown[]): string =>
    String(values.find((value) =>
        (typeof value === 'string' && value.length > 0) || typeof value === 'number'
    ) ?? '');

const getResponseArray = (response: unknown, keys: string[]): ApiRecord[] => {
    let current = response;
    while (current && !Array.isArray(current)) {
        const record = asRecord(current);
        if (!record) return [];
        const key = keys.find((candidate) => Array.isArray(record[candidate]));
        if (key) {
            return (record[key] as unknown[]).map(asRecord).filter((item): item is ApiRecord => !!item);
        }
        if (record.data && typeof record.data === 'object') {
            current = record.data;
            continue;
        }
        return [];
    }
    return Array.isArray(current)
        ? current.map(asRecord).filter((item): item is ApiRecord => !!item)
        : [];
};

const getOptionId = (item: ApiRecord): string =>
    asString(item._id, item.id, item.cityId, item.bostaCityId);

const getOptionName = (item: ApiRecord): string =>
    asString(item.name, item.cityName, item.city_name, item.ar_name, item.nameEn);

const getBostaDistricts = (response: unknown): BostaDistrictOption[] => {
    const result: BostaDistrictOption[] = [];
    const visited = new Set<string>();

    const visit = (items: ApiRecord[], parentZone?: { id: string; name: string }) => {
        items.forEach((item) => {
            const nestedZone = asRecord(item.zone);
            const zoneId = asString(
                item.bostaZoneId, item.zoneId, item.zone_id,
                nestedZone?._id, nestedZone?.id, parentZone?.id
            );
            const zoneName = asString(
                item.bostaZoneName, item.zoneName, item.zone_name,
                nestedZone?.name, parentZone?.name
            );
            const districts = [
                ...getResponseArray(item.districts, []),
                ...getResponseArray(item.children, []),
            ];
            const zoneChildren = [
                ...getResponseArray(item.zones, []),
            ];

            if (districts.length > 0 || zoneChildren.length > 0) {
                const itemId = getOptionId(item);
                const itemName = getOptionName(item);
                const nextParent = zoneChildren.length > 0
                    ? parentZone
                    : { id: zoneId || itemId, name: zoneName || itemName };
                visit(districts, nextParent);
                visit(zoneChildren, parentZone);
                return;
            }

            const districtId = asString(item.bostaDistrictId, item.districtId, item.district_id, getOptionId(item));
            const districtName = asString(item.bostaDistrictName, item.districtName, item.district_name, getOptionName(item));
            if (!districtId || !districtName || !zoneId || !zoneName) return;

            const key = `${zoneId}:${districtId}`;
            if (visited.has(key)) return;
            visited.add(key);
            result.push({
                _id: key,
                name: districtName,
                zoneId,
                zoneName,
                districtId,
                districtName,
            });
        });
    };

    visit(getResponseArray(response, ['districts', 'zones', 'items', 'results']));
    return result;
};

export default function CheckoutPage() {
    const { logoUrl } = useStoreSettings();
    const { t, isRtl, language, getLocalized, formatPrice } = useTranslation();
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
    const [guestDistrict, setGuestDistrict] = useState('');
    const [guestStreet, setGuestStreet] = useState('');
    const [guestBuildingNumber, setGuestBuildingNumber] = useState('');
    const [guestFloorNumber, setGuestFloorNumber] = useState('');
    const [guestApartmentNumber, setGuestApartmentNumber] = useState('');
    const [guestLandmark, setGuestLandmark] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [proofFileName, setProofFileName] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentType, setPaymentType] = useState<'full' | 'installment'>('full');
    const [installmentMonths, setInstallmentMonths] = useState('3');
    const [installmentDownPayment, setInstallmentDownPayment] = useState('');
    const [installmentPreview, setInstallmentPreview] = useState<any>(null);
    const [installmentPreviewError, setInstallmentPreviewError] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [installmentResult, setInstallmentResult] = useState<any>(null);
    const [orderReference, setOrderReference] = useState<string>('');

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

    const { data: shippingMethodResponse, isLoading: isLoadingShippingMethod, isError: isShippingMethodError } = useGet<unknown>(
        ['active-shipping-method'],
        '/shipping/active-method'
    );
    const shippingMethodEnvelope = asRecord(shippingMethodResponse);
    const shippingMethodDataEnvelope = asRecord(shippingMethodEnvelope?.data);
    const shippingMethodData = asRecord(shippingMethodDataEnvelope?.data) || shippingMethodDataEnvelope || {};
    const bostaShippingConfig = asRecord(shippingMethodData.bosta);
    const isBostaShipping = asString(shippingMethodData.activeMethod).toLowerCase() === 'bosta';
    const bostaCitiesEndpoint = String(bostaShippingConfig?.citiesEndpoint || '/api/store/shipping/bosta/cities')
        .replace(/^\/api\/store/, '');
    const bostaDistrictsEndpoint = String(bostaShippingConfig?.districtsEndpoint || '/api/store/shipping/bosta/districts/:cityId')
        .replace(/^\/api\/store/, '');
    const { data: bostaCitiesResponse, isLoading: isLoadingBostaCities, isError: isBostaCitiesError } = useGet<unknown>(
        ['bosta-cities'],
        bostaCitiesEndpoint,
        { enabled: isBostaShipping }
    );
    const districtsPath = bostaDistrictsEndpoint.replace(':cityId', encodeURIComponent(guestCity));
    const { data: bostaDistrictsResponse, isLoading: isLoadingBostaDistricts, isError: isBostaDistrictsError } = useGet<unknown>(
        ['bosta-districts', guestCity],
        districtsPath,
        { enabled: isBostaShipping && !!guestCity }
    );
    const bostaCities: BostaCityOption[] = getResponseArray(bostaCitiesResponse, ['cities', 'items', 'results'])
        .map((city) => ({ _id: getOptionId(city), name: getOptionName(city) }))
        .filter((city: BostaCityOption) => city._id && city.name);
    const bostaDistricts = getBostaDistricts(bostaDistrictsResponse);
    const bostaZones = Array.from(new Map(
        bostaDistricts.map((district) => [district.zoneId, { _id: district.zoneId, name: district.zoneName }])
    ).values());
    const bostaDistrictOptions = React.useMemo(() => {
        const list = guestZone
            ? bostaDistricts.filter((district) => district.zoneId === guestZone)
            : bostaDistricts;
        const nameCounts = new Map<string, number>();
        list.forEach((d) => {
            nameCounts.set(d.districtName, (nameCounts.get(d.districtName) || 0) + 1);
        });
        return list.map((district) => ({
            _id: district._id,
            name: (nameCounts.get(district.districtName) || 0) > 1
                ? `${district.districtName} (${district.zoneName})`
                : district.districtName,
        }));
    }, [bostaDistricts, guestZone]);
    const selectedBostaCity = bostaCities.find((city) => city._id === guestCity);
    const selectedBostaDistrict = bostaDistricts.find((district) => district._id === guestDistrict);

    // Fetch directly from API
    const { data: cartResponse, isLoading: isFetchingCart } = useGet<any>(
        ['checkout-cart'],
        '/cart'
    );
    const backendCart = cartResponse?.data?.cart || cartResponse?.cart;
    // Snapshot of the Redux cart on first render, before setCartState overwrites it with the /cart response.
    // Used as a fallback source for variant data when the /cart response doesn't include it.
    const initialReduxItems = useRef<any[]>(reduxItems);
    const rawItems: any[] = backendCart?.cartItems || reduxItems;
    const items = React.useMemo(() => rawItems.map((item: any) => {
        if (getCartItemVariations(item, isRtl).length > 0) return item;
        const productId = item.product?._id || item.product;
        const fallback = initialReduxItems.current.find((r: any) =>
            r.product?._id === productId &&
            r.variant &&
            (!item.variant?._id || r.variant?._id === item.variant._id)
        );
        return fallback ? { ...item, variant: fallback.variant } : item;
    }), [rawItems, isRtl]);

    // TEMP DEBUG: remove after checking the console
    useEffect(() => {
        console.log('CHECKOUT api item:', JSON.stringify(rawItems[0], null, 2));
        console.log('CHECKOUT redux snapshot item:', JSON.stringify(initialReduxItems.current[0], null, 2));
        console.log('CHECKOUT variations result:', items[0] ? getCartItemVariations(items[0], isRtl) : null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartResponse]);
    const totalCartPrice = backendCart?.totalCartPrice ?? reduxTotalPrice ?? 0;
    const backendShippingCost = cartResponse?.data?.shippingCost || 0;
    const taxAmount = backendCart?.taxAmount || 0;
    const serviceFee = backendCart?.serviceFee || 0;
    const couponDiscount = backendCart?.couponDiscount || 0;

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
        '/address/lists',
        { enabled: !isLoadingShippingMethod && !isShippingMethodError && !isBostaShipping }
    );
    const lists: any = listsData?.data || listsData || { countries: [], cities: [], zones: [] };
    const filteredCities = lists.cities?.filter((c: any) => c.country === guestCountry || !c.country) || [];
    const filteredZones = lists.zones?.filter((z: any) => z.cityId === guestCity || !z.cityId) || [];

    // Calculate dynamic shipping cost based on selected city/zone or saved address
    const shippingCost = React.useMemo(() => {
        if (selectedOrderType === 'pickup') return 0;

        // If guest or manual city selection:
        if (!token || !selectedAddress) {
            const selectedZoneObj = lists.zones?.find((z: any) => z._id === guestZone);
            const selectedCityObj = lists.cities?.find((c: any) => c._id === guestCity);

            const zoneCost = Number(selectedZoneObj?.shipingCost ?? selectedZoneObj?.cost);
            const cityCost = Number(selectedCityObj?.shipingCost ?? selectedCityObj?.cost);

            if (!isNaN(zoneCost) && zoneCost > 0) return zoneCost;
            if (!isNaN(cityCost) && cityCost > 0) return cityCost;
        } else {
            // Logged in user with selected address:
            const currentAddr = addresses.find((a: any) => a._id === selectedAddress);
            if (currentAddr) {
                const zoneId = typeof currentAddr.zone === 'object' ? currentAddr.zone?._id : currentAddr.zone;
                const cityId = typeof currentAddr.city === 'object' ? currentAddr.city?._id : currentAddr.city;

                const zoneObj = lists.zones?.find((z: any) => z._id === zoneId) || (typeof currentAddr.zone === 'object' ? currentAddr.zone : null);
                const cityObj = lists.cities?.find((c: any) => c._id === cityId) || (typeof currentAddr.city === 'object' ? currentAddr.city : null);

                const zoneCost = Number(zoneObj?.shipingCost ?? zoneObj?.cost);
                const cityCost = Number(cityObj?.shipingCost ?? cityObj?.cost);

                if (!isNaN(zoneCost) && zoneCost > 0) return zoneCost;
                if (!isNaN(cityCost) && cityCost > 0) return cityCost;
            }
        }

        return backendShippingCost || 0;
    }, [selectedOrderType, token, selectedAddress, guestZone, guestCity, lists, addresses, backendShippingCost]);

    const finalTotal = totalCartPrice + shippingCost + taxAmount + serviceFee - couponDiscount;

    // Fetch payment methods
    const { data: pmData, isLoading: isFetchingPm } = useGet<any>(
        ['payment-methods'],
        '/payment-methods'
    );
    const paymentMethodsList = Array.isArray(pmData?.data?.data)
        ? pmData.data.data
        : Array.isArray(pmData?.data) ? pmData.data : [];

    // Fetch installment settings (public endpoint)
    const { data: installmentSettingsResponse } = useGet<any>(
        ['installment-settings'],
        '/installments/settings'
    );
    const installmentSettings = installmentSettingsResponse?.data?.settings
        || installmentSettingsResponse?.settings
        || null;
    const installmentEnabled = Boolean(installmentSettings?.enabled);
    const maxInstallments = Math.max(1, Number(installmentSettings?.max_installments) || 12);
    const minDownPaymentPercent = Math.max(0, Number(installmentSettings?.min_down_payment_percent) || 0);
    const minDownPayment = Math.max(0, (finalTotal * minDownPaymentPercent) / 100);

    // Fetch order types
    const { data: otData, isLoading: isFetchingOt } = useGet<any>(
        ['order-types'],
        '/order-type'
    );
    const orderTypesList = React.useMemo(() => {
        const list: any[] = Array.isArray(otData?.data?.data)
            ? otData.data.data
            : Array.isArray(otData?.data) ? otData.data : [];
        // Remove duplicated order types (same type returned more than once)
        return list.filter((ot: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.type === ot.type) === i);
    }, [otData]);

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

    // 🧮 Installment preview (debounced) — uses the backend calculation
    useEffect(() => {
        if (paymentType !== 'installment') {
            setInstallmentPreview(null);
            setInstallmentPreviewError('');
            setIsPreviewLoading(false);
            return;
        }

        const months = Number(installmentMonths);
        const down = Number(installmentDownPayment) || 0;

        if (!installmentEnabled) {
            setInstallmentPreview(null);
            setInstallmentPreviewError(t.checkout.installments.previewError);
            setIsPreviewLoading(false);
            return;
        }

        if (!months || months < 1 || months > maxInstallments) {
            setInstallmentPreview(null);
            setInstallmentPreviewError('');
            setIsPreviewLoading(false);
            return;
        }

        if (finalTotal <= 0) {
            setIsPreviewLoading(false);
            return;
        }

        if (down >= finalTotal) {
            setInstallmentPreview(null);
            setInstallmentPreviewError(t.checkout.installments.downPaymentTooHigh);
            setIsPreviewLoading(false);
            return;
        }

        if (down + 0.001 < minDownPayment) {
            setInstallmentPreview(null);
            setInstallmentPreviewError(
                `${t.checkout.installments.downPaymentTooLow} ${minDownPayment.toLocaleString()} ${t.common.currency}`
            );
            setIsPreviewLoading(false);
            return;
        }

        let cancelled = false;
        setIsPreviewLoading(true);

        const timer = setTimeout(async () => {
            try {
                const { data } = await axiosInstance.post('/installments/preview', {
                    total: finalTotal,
                    months,
                    down_payment: down,
                });
                if (!cancelled) {
                    setInstallmentPreview(data?.data?.plan || null);
                    setInstallmentPreviewError('');
                }
            } catch (err: any) {
                if (!cancelled) {
                    setInstallmentPreview(null);
                    setInstallmentPreviewError(
                        err?.response?.data?.error?.message
                        || t.checkout.installments.previewError
                    );
                }
            } finally {
                if (!cancelled) setIsPreviewLoading(false);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [paymentType, installmentMonths, installmentDownPayment, finalTotal, minDownPayment, maxInstallments, installmentEnabled, t]);

    const handleSelectInstallment = () => {
        if (!installmentEnabled) return;
        if (!token) {
            toast.error(t.checkout.installments.loginRequired);
            return;
        }
        setPaymentType('installment');
        setInstallmentMonths(String(Math.min(3, maxInstallments)));
        setInstallmentDownPayment(
            minDownPayment > 0 ? String(Math.round(minDownPayment * 100) / 100) : '0'
        );
        setInstallmentPreview(null);
        setInstallmentPreviewError('');
    };

    const installmentBlocked = paymentType === 'installment' && (
        !token
        || !installmentEnabled
        || !installmentPreview
        || isPreviewLoading
        || !!installmentPreviewError
        || Number(installmentMonths) < 1
        || Number(installmentMonths) > maxInstallments
        || Number(installmentDownPayment || 0) >= finalTotal
        || Number(installmentDownPayment || 0) + 0.001 < minDownPayment
    );

    // Checkout Mutation
    const { mutate: placeOrder, isPending: isPlacingOrder } = usePost(
        '/order/checkout',
        ['cart', 'orders'],
        t.checkout.orderPlacedSuccess
    );

    // Add Address Mutation
    const { mutate: addAddress, isPending: isAddingAddress } = usePost(
        '/address',
        ['addresses'],
        t.checkout.addressAddedSuccess
    );

    const handleAddAddress = () => {
        if (!newAddrCountry || !newAddrCity || !newAddrZone || !newAddrStreet || !newAddrBuilding) {
            toast.error(t.checkout.addressFieldsError);
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
                toast.error(t.checkout.orderTypePickupError);
                return;
            }
        } else {
            if (isLoadingShippingMethod || isShippingMethodError) {
                toast.error(t.checkout.shippingMethodErrorSubmit);
                return;
            }

            if (isBostaShipping && (!guestCity || !guestDistrict || !guestZone || !guestStreet || !guestBuildingNumber)) {
                toast.error(t.checkout.bostaAddressError);
                return;
            }

            if (!isBostaShipping && !token && (!guestCountry || !guestCity || !guestZone || !guestStreet || !guestBuildingNumber)) {
                toast.error(t.checkout.deliveryDetailsError);
                return;
            }

            if (!isBostaShipping && token && !selectedAddress) {
                toast.error(t.checkout.shippingAddressError);
                return;
            }
        }

        if (paymentType === 'installment') {
            if (!token) {
                toast.error(t.checkout.installments.loginRequired);
                return;
            }
            if (!installmentEnabled) {
                toast.error(t.checkout.installments.previewError);
                return;
            }
            if (!installmentPreview || isPreviewLoading) {
                toast.error(t.checkout.installments.previewError);
                return;
            }
        }

        const payload: any = {
            orderType: selectedOrderType,
            paymentMethod: paymentMethod,
            paymentType: paymentType === 'installment' ? 'installment' : 'full',
            shippingCost: shippingCost,
        };

        if (paymentType === 'installment') {
            payload.installment = {
                months: Number(installmentMonths),
                down_payment: Number(installmentDownPayment) || 0,
            };
        }

        if (selectedOrderType === 'pickup') {
            payload.warehouseId = selectedWarehouse;
        } else if (isBostaShipping) {
            if (!selectedBostaCity || !selectedBostaDistrict) {
                toast.error(t.checkout.validBostaAddressError);
                return;
            }
            payload.shippingAddress = {
                street: guestStreet,
                buildingNumber: guestBuildingNumber,
                floorNumber: guestFloorNumber,
                apartmentNumber: guestApartmentNumber,
                uniqueIdentifier: guestLandmark,
                bostaCityId: selectedBostaCity._id,
                bostaCityName: selectedBostaCity.name,
                bostaZoneId: selectedBostaDistrict.zoneId,
                bostaZoneName: selectedBostaDistrict.zoneName,
                bostaDistrictId: selectedBostaDistrict.districtId,
                bostaDistrictName: selectedBostaDistrict.districtName,
            };
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

        if (proofImage && paymentType !== 'installment') {
            payload.proofImage = proofImage;
        }

        placeOrder(payload, {
            onSuccess: (res: any) => {
                const iframeUrl = res?.iframeUrl || res?.data?.iframeUrl || res?.data?.payment?.iframeUrl || res?.payment?.iframeUrl || res?.data?.order?.payment?.iframeUrl;
                const installmentPlan = res?.data?.installment_plan || res?.installment_plan || null;
                const createdOrder = res?.data?.order || res?.order || null;
                const reference = createdOrder?.reference || res?.data?.reference || res?.reference || '';

                if (reference) setOrderReference(String(reference));

                dispatch(clearCartLocal());
                toast.success(t.checkout.orderPlacedSuccess);

                if (installmentPlan) {
                    setInstallmentResult(installmentPlan);
                    setIsSuccess(true);
                } else if (iframeUrl) {
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
                <h1 className="text-4xl font-black text-primary tracking-tighter mb-4">
                    {installmentResult
                        ? t.checkout.installments.successTitle
                        : t.checkout.orderConfirmedTitle}
                </h1>
                <p className="text-gray-500 font-medium max-w-sm mb-8">
                    {installmentResult
                        ? t.checkout.installments.successDesc
                        : t.checkout.confirmedDesc}
                </p>
                {installmentResult && (
                    <div className="w-full max-w-md bg-secondary/5 border-2 border-secondary/20 rounded-3xl p-6 text-start space-y-3 mb-8">
                        {orderReference && (
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="font-bold text-gray-500">{t.checkout.orderReference}</span>
                                <span className="font-black text-primary font-mono tracking-wider">{orderReference}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="font-bold text-gray-500">{t.checkout.installments.planNumber}</span>
                            <span className="font-black text-primary">{installmentResult.plan_number}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="font-bold text-gray-500">{t.checkout.installments.downPayment}</span>
                            <span className="font-black text-primary">{formatPrice(installmentResult.down_payment)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="font-bold text-gray-500">{t.checkout.installments.totalPayable}</span>
                            <span className="font-black text-primary">{formatPrice(installmentResult.total_payable)}</span>
                        </div>
                        {installmentResult?.installments?.[0] && (
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="font-bold text-gray-500">{t.checkout.installments.firstInstallment}</span>
                                <span className="font-black text-primary">
                                    {formatPrice(installmentResult.installments[0].amount)} — {new Date(installmentResult.installments[0].due_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB')}
                                </span>
                            </div>
                        )}
                        <p className="text-xs font-bold text-secondary pt-2 border-t border-secondary/10">
                            {t.checkout.installments.branchNote}
                        </p>
                    </div>
                )}

                {!installmentResult && orderReference && (
                    <div className="w-full max-w-md bg-primary/5 border-2 border-primary/10 rounded-3xl p-6 text-center mb-8">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                            {t.checkout.orderReference}
                        </p>
                        <p className="text-4xl font-black text-primary font-mono tracking-[0.2em]">
                            {orderReference}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-3">
                            {t.checkout.referenceHint}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                    {orderReference && (
                        <button
                            onClick={() => router.push(`/order-tracking?ref=${encodeURIComponent(orderReference)}`)}
                            className="px-8 py-3 bg-secondary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-secondary/20"
                        >
                            {t.tracking.trackButton}
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/profile?tab=orders')}
                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                        {t.checkout.viewOrders}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-primary/20"
                    >
                        {t.checkout.continueShopping}
                    </button>
                </div>
            </div>
        );
    }

    if (isFetchingCart && items.length === 0) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <StoreLoader logoUrl={logoUrl} label={t.checkout.secureCheckoutLoading} size="lg" />
            </div>
        );
    }

    if (items.length === 0 && !isSuccess) return null;

    return (
        <div className="w-full px-4 md:px-12 py-6 pb-24">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <h1 className="text-4xl font-black text-primary tracking-tight">{t.checkout.secureCheckoutTitle}</h1>
                {token ? (
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
                    >
                        <User size={16} /> {t.nav.profile}
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-sm font-bold text-white hover:shadow-lg transition"
                    >
                        <LogIn size={16} /> {t.nav.login}
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    {/* Order Type Selection */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">1</div>
                            <h2 className="text-2xl font-black text-primary">{t.checkout.orderType}</h2>
                        </div>
                        {isFetchingOt ? (
                            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : orderTypesList.length === 0 ? (
                            <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center">
                                <p className="text-gray-400 font-medium">{t.checkout.noOrderTypes}</p>
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
                                                <p className="font-black text-primary text-lg capitalize">{isPickup ? t.checkout.pickUpFromBranch : t.checkout.deliverToDoor}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    {isPickup ? t.checkout.pickupDesc : t.checkout.deliveryDesc}
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
                                {selectedOrderType === 'pickup' ? t.checkout.selectBranch : t.checkout.shippingAddress}
                            </h2>
                        </div>

                        {selectedOrderType === 'pickup' ? (
                            isFetchingW ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : warehousesList.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                                    <Store className="mx-auto text-gray-300 mb-4" size={40} />
                                    <p className="text-gray-500 font-black text-lg mb-2">{t.checkout.noBranches}</p>
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
                                                    <p className="font-black text-primary text-lg">{wh.name || t.checkout.branch}</p>
                                                    <p className="text-sm font-bold text-gray-500 mt-1">{wh.address || t.checkout.noAddress}</p>
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
                        ) : isLoadingShippingMethod ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : isShippingMethodError ? (
                            <div className="p-6 border border-red-200 bg-red-50 rounded-2xl text-center">
                                <p className="text-red-600 font-bold">{t.checkout.shippingMethodError}</p>
                            </div>
                        ) : isBostaShipping || !token ? (
                            <div className="bg-gray-50/50 p-6 sm:p-8 rounded-[32px] border-2 border-gray-100 mb-6">
                                <h3 className="text-2xl font-black text-primary mb-6">{t.checkout.deliveryDetails}</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isBostaShipping ? (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.country}</label>
                                                    <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-primary">{t.checkout.countryEgypt}</div>
                                                </div>
                                                {isBostaCitiesError ? (
                                                    <p className="md:col-span-2 text-sm font-bold text-red-600">{t.checkout.bostaCitiesError}</p>
                                                ) : (
                                                    <SearchableSelect
                                                        label={t.checkout.city}
                                                        options={bostaCities}
                                                        value={guestCity}
                                                        onChange={(val) => { setGuestCity(val); setGuestZone(''); setGuestDistrict(''); }}
                                                        placeholder={isLoadingBostaCities ? t.checkout.loadingCities : t.checkout.pickCity}
                                                        disabled={isLoadingBostaCities}
                                                    />
                                                )}
                                                {guestCity && (isLoadingBostaDistricts ? (
                                                    <div className="md:col-span-2 flex items-center gap-2 text-sm font-bold text-gray-400">
                                                        <Loader2 size={16} className="animate-spin" /> {t.checkout.loadingDeliveryAreas}
                                                    </div>
                                                ) : isBostaDistrictsError ? (
                                                    <p className="md:col-span-2 text-sm font-bold text-red-600">{t.checkout.bostaAreasError}</p>
                                                ) : (
                                                    <>
                                                        <SearchableSelect
                                                            label={t.checkout.district}
                                                            options={bostaDistrictOptions}
                                                            value={guestDistrict}
                                                            onChange={(val) => {
                                                                setGuestDistrict(val);
                                                                const matched = bostaDistricts.find((d) => d._id === val);
                                                                if (matched) {
                                                                    setGuestZone(matched.zoneId);
                                                                }
                                                            }}
                                                            placeholder={t.checkout.pickDistrict}
                                                            disabled={!bostaDistrictOptions.length}
                                                        />
                                                        <SearchableSelect
                                                            label={t.checkout.zone}
                                                            options={bostaZones}
                                                            value={guestZone}
                                                            onChange={(val) => {
                                                                setGuestZone(val);
                                                                const currentDist = bostaDistricts.find((d) => d._id === guestDistrict);
                                                                if (currentDist && currentDist.zoneId !== val) {
                                                                    setGuestDistrict('');
                                                                }
                                                            }}
                                                            placeholder={t.checkout.pickZone}
                                                            disabled={!bostaZones.length}
                                                        />
                                                        {!bostaDistricts.length && (
                                                            <p className="md:col-span-2 text-sm font-bold text-amber-600">{t.checkout.noDeliveryAreas}</p>
                                                        )}
                                                    </>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <SearchableSelect
                                                    label={t.checkout.country}
                                                    options={lists.countries || []}
                                                    value={guestCountry}
                                                    onChange={(val) => { setGuestCountry(val); setGuestCity(''); setGuestZone(''); }}
                                                    placeholder={t.checkout.pickCity}
                                                />
                                                <SearchableSelect
                                                    label={t.checkout.city}
                                                    options={filteredCities}
                                                    value={guestCity}
                                                    onChange={(val) => { setGuestCity(val); setGuestZone(''); }}
                                                    placeholder={t.checkout.pickCity}
                                                    disabled={!guestCountry}
                                                />
                                                <SearchableSelect
                                                    label={t.checkout.zone}
                                                    options={filteredZones}
                                                    value={guestZone}
                                                    onChange={(val) => setGuestZone(val)}
                                                    placeholder={t.checkout.pickZone}
                                                    disabled={!guestCity}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.streetName}</label>
                                            <input type="text" placeholder={t.checkout.streetPlaceholder} value={guestStreet} onChange={(e) => setGuestStreet(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.buildingNumber}</label>
                                            <input type="text" placeholder={t.checkout.buildingPlaceholder} value={guestBuildingNumber} onChange={(e) => setGuestBuildingNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.floor}</label>
                                            <input type="number" placeholder={t.checkout.floorPlaceholder} value={guestFloorNumber} onChange={(e) => setGuestFloorNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.apartment}</label>
                                            <input type="number" placeholder={t.checkout.apartmentPlaceholder} value={guestApartmentNumber} onChange={(e) => setGuestApartmentNumber(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.landmark}</label>
                                            <input type="text" placeholder={t.checkout.landmarkPlaceholder} value={guestLandmark} onChange={(e) => setGuestLandmark(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-secondary outline-none transition-all font-medium text-gray-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : isFetchingAddresses ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : addresses.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50">
                                <MapPin className="mx-auto text-gray-300 mb-4" size={40} />
                                <p className="text-gray-500 font-black text-lg mb-2">{t.checkout.noSavedAddresses}</p>
                                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{t.checkout.needAddress}</p>
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
                                                        {addr.city?.name || t.checkout.city}
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-lg">
                                                        {addr.zone?.name || t.checkout.zone}
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
                                    <p className="font-bold text-gray-500 text-sm group-hover:text-secondary transition-colors">{t.checkout.addNewAddress}</p>
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
                                            <h2 className="text-xl font-black text-primary">{t.checkout.addNewAddress}</h2>
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
                                                label={`${t.checkout.country} *`}
                                                options={lists.countries || []}
                                                value={newAddrCountry}
                                                onChange={(val) => { setNewAddrCountry(val); setNewAddrCity(''); setNewAddrZone(''); }}
                                                placeholder={t.checkout.pickCountry}
                                            />
                                            <SearchableSelect
                                                label={`${t.checkout.city} *`}
                                                options={(lists.cities || []).filter((c: any) => c.country === newAddrCountry || !c.country)}
                                                value={newAddrCity}
                                                onChange={(val) => { setNewAddrCity(val); setNewAddrZone(''); }}
                                                placeholder={t.checkout.pickCity}
                                                disabled={!newAddrCountry}
                                            />
                                            <div className="sm:col-span-2">
                                                <SearchableSelect
                                                    label={`${t.checkout.zone} *`}
                                                    options={(lists.zones || []).filter((z: any) => z.cityId === newAddrCity || !z.cityId)}
                                                    value={newAddrZone}
                                                    onChange={(val) => setNewAddrZone(val)}
                                                    placeholder={t.checkout.pickZone}
                                                    disabled={!newAddrCity}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.streetName} *</label>
                                            <input
                                                type="text"
                                                placeholder={t.checkout.streetPlaceholder}
                                                value={newAddrStreet}
                                                onChange={e => setNewAddrStreet(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.buildingNumber} *</label>
                                                <input
                                                    type="text"
                                                    placeholder={t.checkout.buildingPlaceholder}
                                                    value={newAddrBuilding}
                                                    onChange={e => setNewAddrBuilding(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.floor}</label>
                                                <input
                                                    type="number"
                                                    placeholder={t.checkout.floorPlaceholder}
                                                    value={newAddrFloor}
                                                    onChange={e => setNewAddrFloor(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.apartment}</label>
                                                <input
                                                    type="number"
                                                    placeholder={t.checkout.apartmentPlaceholder}
                                                    value={newAddrApartment}
                                                    onChange={e => setNewAddrApartment(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:bg-white outline-none transition-all font-medium text-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkout.landmark}</label>
                                                <input
                                                    type="text"
                                                    placeholder={t.checkout.landmarkPlaceholder}
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
                                            {isAddingAddress ? t.checkout.saving : t.checkout.saveAddress}
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
                            <h2 className="text-2xl font-black text-primary">{t.checkout.paymentMethod}</h2>
                        </div>

                        {isFetchingPm ? (
                            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : paymentMethodsList.length === 0 ? (
                            <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center">
                                <p className="text-gray-400 font-medium">{t.checkout.noPaymentMethods}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {paymentMethodsList.map((methodObj: any, idx: number) => {
                                    const methodIdentifier = methodObj._id || methodObj.name || methodObj.id || methodObj;
                                    const methodName = methodObj.name || methodObj.title || methodObj.method || t.checkout.unknown;
                                    const methodLogo = methodObj.logo || methodObj.icon;
                                    const methodDesc = methodObj.description || methodObj.discription;
                                    const isCash = methodName?.toLowerCase() === 'cash' || String(methodIdentifier).toLowerCase() === 'cash';

                                    return (
                                        <div
                                            key={methodIdentifier || idx}
                                            onClick={() => {
                                                setPaymentMethod(methodIdentifier);
                                                setPaymentType('full');
                                            }}
                                            className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-center gap-5 ${paymentType === 'full' && paymentMethod === methodIdentifier ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' : 'border-gray-100 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${paymentType === 'full' && paymentMethod === methodIdentifier ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                {methodLogo ? (
                                                    <img src={methodLogo} alt={methodName} className="w-8 h-8 object-contain" />
                                                ) : isCash ? (
                                                    <Banknote size={28} />
                                                ) : (
                                                    <CreditCard size={28} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-lg capitalize">{isCash ? t.checkout.cashOnDelivery : methodName}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    {methodDesc || (isCash ? t.checkout.payWhenReceived : t.checkout.payOnline)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {installmentEnabled && (
                                    <div
                                        onClick={handleSelectInstallment}
                                        className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-center gap-5 ${paymentType === 'installment' ? 'border-secondary bg-secondary/5 shadow-xl shadow-secondary/10' : 'border-gray-100 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${paymentType === 'installment' ? 'bg-secondary text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            <CalendarClock size={28} />
                                        </div>
                                        <div>
                                            <p className="font-black text-primary text-lg">{t.checkout.installments.option}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                {t.checkout.installments.optionDesc}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentType === 'installment' && installmentEnabled && (
                            <div className="mt-6 p-6 rounded-[24px] border-2 border-secondary/30 bg-secondary/5 space-y-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-black text-primary">{t.checkout.installments.title}</h3>
                                    <span className="text-xs font-black text-gray-500">
                                        {installmentSettings?.interest_type === 'fixed'
                                            ? `${t.checkout.installments.interest} ${formatPrice(installmentSettings?.interest_value || 0)}`
                                            : `${t.checkout.installments.interest} ${Number(installmentSettings?.interest_value || 0)}%`}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            {t.checkout.installments.months}
                                        </label>
                                        <select
                                            value={installmentMonths}
                                            onChange={(e) => setInstallmentMonths(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-primary"
                                        >
                                            {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            {t.checkout.installments.downPayment}
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={installmentDownPayment}
                                            onChange={(e) => setInstallmentDownPayment(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-primary"
                                        />
                                        <p className="text-[10px] font-bold text-gray-400">
                                            {t.checkout.installments.minDownPayment}: {formatPrice(minDownPayment)} ({minDownPaymentPercent}%)
                                        </p>
                                    </div>
                                </div>

                                {isPreviewLoading ? (
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <Loader2 size={16} className="animate-spin" />
                                        {t.checkout.installments.calculating}
                                    </div>
                                ) : installmentPreviewError ? (
                                    <p className="text-sm font-bold text-red-600">{installmentPreviewError}</p>
                                ) : installmentPreview ? (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="font-bold text-gray-500">{t.checkout.installments.financed}</span>
                                            <span className="font-black text-primary">{formatPrice(installmentPreview.financed_amount)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="font-bold text-gray-500">{t.checkout.installments.interest}</span>
                                            <span className="font-black text-primary">{formatPrice(installmentPreview.interest_amount)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="font-bold text-primary">{t.checkout.installments.totalPayable}</span>
                                            <span className="font-black text-primary">{formatPrice(installmentPreview.total_payable)}</span>
                                        </div>
                                        {installmentPreview.installments?.length > 0 && (
                                            <div className="flex justify-between gap-4">
                                                <span className="font-bold text-gray-500">{t.checkout.installments.monthly}</span>
                                                <span className="font-black text-primary">
                                                    {formatPrice(installmentPreview.installments[0].amount)}
                                                    {installmentPreview.installments.length > 1
                                                        && Number(installmentPreview.installments[0].amount) !== Number(installmentPreview.installments[installmentPreview.installments.length - 1].amount)
                                                        && (
                                                            <span className="text-gray-400 font-bold">
                                                                {' '}→ {formatPrice(installmentPreview.installments[installmentPreview.installments.length - 1].amount)}
                                                            </span>
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between gap-4 pt-2 border-t border-secondary/20">
                                            <span className="font-black text-secondary">{t.checkout.installments.dueNow}</span>
                                            <span className="font-black text-secondary">{formatPrice(installmentPreview.down_payment)}</span>
                                        </div>

                                        {installmentPreview.installments?.length > 0 && (
                                            <details className="pt-2">
                                                <summary className="cursor-pointer text-xs font-black text-secondary">
                                                    {t.checkout.installments.showSchedule}
                                                </summary>
                                                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                                    {installmentPreview.installments.map((item: { sequence: number; due_date: string; amount: number }) => (
                                                        <li key={item.sequence} className="flex justify-between gap-4 text-xs">
                                                            <span className="font-bold text-gray-500">
                                                                {t.checkout.installments.installmentItem} {item.sequence} —{' '}
                                                                {new Date(item.due_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB')}
                                                            </span>
                                                            <span className="font-black text-primary">{formatPrice(item.amount)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </div>
                                ) : null}

                                <div className="flex items-start gap-2 text-xs font-bold text-secondary bg-white rounded-xl p-3 border border-secondary/20">
                                    <ShieldCheck size={16} className="shrink-0" />
                                    {t.checkout.installments.branchNote}
                                </div>
                            </div>
                        )}

                        {paymentMethod && paymentType !== 'installment' && (
                            <div className="mt-6 p-6 rounded-[24px] border-2 border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-black text-primary mb-2">{t.checkout.paymentProof}</h3>
                                <p className="text-sm font-bold text-gray-500 mb-4">{t.checkout.paymentProofDesc}</p>
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
                                        <CheckCircle2 size={16} /> {t.checkout.attached}: {proofFileName}
                                    </p>
                                )}
                            </div>
                        )}

                    </section>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-primary text-white rounded-[40px] p-8 md:p-10 sticky top-32 shadow-2xl shadow-primary/30">
                        <h2 className="text-2xl font-black mb-8 italic tracking-tighter">{t.checkout.orderSummary}</h2>

                        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item: any) => (
                                <div key={`${item.product._id}-${item.variant?._id || 'no-variant'}`} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0">
                                        <img src={item.product.image || item.product.gallery_product?.[0] || logoUrl || undefined} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm line-clamp-1">{getLocalized(item.product, 'name') || item.product.name || item.product.ar_name}</p>
                                        {(() => {
                                            const variations = getCartItemVariations(item, isRtl);
                                            if (variations.length === 0) return null;
                                            return (
                                                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                                                    {variations.map((v, vIdx) => (
                                                        <span
                                                            key={vIdx}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/10 text-white border border-white/10"
                                                        >
                                                            <span className="text-white/60 font-medium">{v.name}:</span>
                                                            <span className="font-black text-white">{v.value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{t.checkout.quantity}: {item.quantity}</p>
                                    </div>
                                    <div className="font-black text-secondary">
                                        {(item.price * item.quantity).toLocaleString()} {t.common.currency}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center text-white/70">
                                <span className="font-bold text-sm uppercase tracking-wider">{t.cart.subtotal}</span>
                                <span className="font-black text-lg text-white">{totalCartPrice.toLocaleString()} {t.common.currency}</span>
                            </div>

                            {taxAmount > 0 && (
                                <div className="flex justify-between items-center text-white/70">
                                    <span className="font-bold text-sm uppercase tracking-wider">{t.cart.tax}</span>
                                    <span className="font-black text-lg text-white">{taxAmount.toLocaleString()} {t.common.currency}</span>
                                </div>
                            )}

                            {serviceFee > 0 && (
                                <div className="flex justify-between items-center text-white/70">
                                    <span className="font-bold text-sm uppercase tracking-wider">{t.checkout.serviceFees}</span>
                                    <span className="font-black text-lg text-white">{serviceFee.toLocaleString()} {t.common.currency}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-white/50">
                                <span className="font-bold text-sm uppercase tracking-wider">{t.cart.shipping}</span>
                                {shippingCost > 0 ? (
                                    <span className="font-black text-lg text-white">{shippingCost.toLocaleString()} {t.common.currency}</span>
                                ) : (
                                    <span className="font-black text-[10px] text-white uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">
                                        {selectedOrderType === 'pickup'
                                            ? t.cart.shippingFree
                                            : ((!guestCity && !selectedAddress) ? t.checkout.calculated : t.cart.shippingFree)
                                        }
                                    </span>
                                )}
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-center bg-green-500/20 p-3 rounded-2xl border border-green-500/30">
                                    <div className="flex items-center gap-2">
                                        <Percent size={14} className="text-green-400" />
                                        <span className="font-black text-[10px] uppercase tracking-wider text-green-400">{t.checkout.couponDiscount}</span>
                                    </div>
                                    <span className="font-black text-lg text-green-400">-{couponDiscount.toLocaleString()} {t.common.currency}</span>
                                </div>
                            )}

                            <div className="pt-6 flex justify-between items-center border-t border-white/10">
                                <span className="text-xl font-black italic">{t.cart.total}</span>
                                <span className="text-3xl font-black tracking-tight text-white">{finalTotal.toLocaleString()} <span className="text-base text-white/50">{t.common.currency}</span></span>
                            </div>

                            {paymentType === 'installment' && installmentPreview && (
                                <div className="space-y-2 pt-4 border-t border-white/10 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span className="font-bold">{t.checkout.installments.interest}</span>
                                        <span className="font-black text-white">{formatPrice(installmentPreview.interest_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span className="font-bold">{t.checkout.installments.totalPayable}</span>
                                        <span className="font-black text-white">{formatPrice(installmentPreview.total_payable)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-black text-secondary">{t.checkout.installments.dueNow}</span>
                                        <span className="font-black text-secondary">{formatPrice(installmentPreview.down_payment)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isPlacingOrder || installmentBlocked || (selectedOrderType === 'pickup' ? !selectedWarehouse : (isLoadingShippingMethod || isShippingMethodError || (isBostaShipping ? (!guestCity || !guestZone || !guestDistrict || !guestStreet || !guestBuildingNumber) : (token ? !selectedAddress : (!guestCountry || !guestCity || !guestZone || !guestStreet || !guestBuildingNumber)))))}
                            className="w-full bg-primary text-[var(--color-on-primary)] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:brightness-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 border-2 border-primary"
                        >
                            {isPlacingOrder ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    {t.checkout.confirmOrder} <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                                </>
                            )}
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-3 text-white/40 bg-white/5 py-4 rounded-2xl border border-white/5">
                            <ShieldCheck size={20} className="text-green-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.checkout.secureEncryption}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}