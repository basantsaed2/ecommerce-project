"use client";
import React, { useState, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { usePost } from '@/hooks/usePost';
import { useUpdate } from '@/hooks/useUpdate';
import { useDelete } from '@/hooks/useDelete';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    MapPin, Plus, Edit2, Trash2,
    X, Loader2, Home, Building2,
    Navigation, Globe, Check, AlertCircle
} from 'lucide-react';
import { Address, AddressListsResponse } from '@/types/address';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DeleteDialog from '@/components/ui/DeleteDialog';

const addressSchema = z.object({
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    zone: z.string().min(1, "Zone is required"),
    street: z.string().min(3, "Street must be at least 3 characters"),
    buildingNumber: z.string().min(1, "Building number is required"),
    floorNumber: z.string().optional(),
    apartmentNumber: z.string().optional(),
    uniqueIdentifier: z.string().optional(),
});

export default function AddressManager() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: addressesData, isLoading: isFetching, refetch } = useGet<any>(
        ['addresses'],
        '/api/store/address'
    );

    const { data: listsData } = useGet<any>(
        ['address-lists'],
        '/api/store/address/lists'
    );

    const { mutate: addAddress, isPending: isAdding } = usePost(
        '/api/store/address',
        ['addresses'],
        'Address added successfully'
    );

    const { mutate: updateAddress, isPending: isUpdating } = useUpdate(
        '/api/store/address',
        ['addresses'],
        'Address updated successfully'
    );

    const { mutate: deleteAddress, isPending: isDeleting } = useDelete(
        '/api/store/address',
        ['addresses'],
        'Address deleted successfully'
    );

    const addresses: Address[] = addressesData?.data?.addresses || addressesData?.addresses || [];
    const lists: AddressListsResponse = listsData?.data || listsData || { countries: [], cities: [], zones: [] };

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            country: '',
            city: '',
            zone: '',
            street: '',
            buildingNumber: '',
            floorNumber: '',
            apartmentNumber: '',
            uniqueIdentifier: '',
        }
    });

    const selectedCountry = watch('country');
    const selectedCity = watch('city');

    // Filtered lists for cascading
    const filteredCities = lists.cities?.filter((c: any) => c.country === selectedCountry || !c.country) || [];
    const filteredZones = lists.zones?.filter((z: any) => z.cityId === selectedCity || !z.cityId) || [];

    useEffect(() => {
        if (editingAddress) {
            reset({
                country: editingAddress.country?._id || editingAddress.country,
                city: editingAddress.city?._id || editingAddress.city,
                zone: editingAddress.zone?._id || editingAddress.zone,
                street: editingAddress.street,
                buildingNumber: editingAddress.buildingNumber,
                floorNumber: editingAddress.floorNumber || '',
                apartmentNumber: editingAddress.apartmentNumber || '',
                uniqueIdentifier: editingAddress.uniqueIdentifier || '',
            });
            setIsFormOpen(true);
        } else {
            reset({
                country: '',
                city: '',
                zone: '',
                street: '',
                buildingNumber: '',
                floorNumber: '',
                apartmentNumber: '',
                uniqueIdentifier: '',
            });
        }
    }, [editingAddress, reset]);

    const onSubmit = (data: any) => {
        if (editingAddress) {
            updateAddress({
                id: editingAddress._id,
                updatedData: data
            }, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingAddress(null);
                }
            });
        } else {
            addAddress(data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                }
            });
        }
    };

    const confirmDelete = () => {
        if (addressToDelete) {
            deleteAddress(addressToDelete, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setAddressToDelete(null);
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-primary tracking-tight">Shipping Addresses</h2>
                        <p className="text-gray-400 text-sm font-medium">Manage your delivery locations</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingAddress(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Add New
                </button>
            </div>

            {isFetching ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-bold uppercase tracking-widest text-xs">Loading addresses...</p>
                </div>
            ) : addresses.length === 0 ? (
                <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <MapPin size={40} />
                    </div>
                    <h3 className="text-xl font-black text-primary mb-2">No addresses yet</h3>
                    <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        Add your first shipping address to experience faster checkouts.
                    </p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Create Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <div
                            key={addr._id}
                            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Home size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingAddress(addr)}
                                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAddressToDelete(addr._id);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="font-black text-primary flex items-center gap-2">
                                    {addr.street}
                                </p>
                                <p className="text-gray-400 font-medium text-sm">
                                    Building {addr.buildingNumber}
                                    {addr.floorNumber && `, Floor ${addr.floorNumber}`}
                                    {addr.apartmentNumber && `, Apt ${addr.apartmentNumber}`}
                                </p>
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider pt-2">
                                    {addr.zone?.name || 'Zone'}, {addr.city?.name || 'City'}, {addr.country?.name || 'Country'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />

                    <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-primary tracking-tighter">
                                        {editingAddress ? 'Edit' : 'New'} <span className="text-secondary italic">Address.</span>
                                    </h3>
                                    <p className="text-gray-400 font-medium text-sm mt-1">Please fill in the details below</p>
                                </div>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Country */}
                                    <SearchableSelect
                                        label="Country"
                                        options={lists.countries || []}
                                        value={selectedCountry}
                                        onChange={(val) => {
                                            setValue('country', val);
                                            setValue('city', '');
                                            setValue('zone', '');
                                        }}
                                        error={errors.country?.message as string}
                                        placeholder="Pick Country"
                                    />

                                    {/* City */}
                                    <SearchableSelect
                                        label="City"
                                        options={filteredCities}
                                        value={selectedCity}
                                        onChange={(val) => {
                                            setValue('city', val);
                                            setValue('zone', '');
                                        }}
                                        error={errors.city?.message as string}
                                        placeholder="Pick City"
                                        disabled={!selectedCountry}
                                    />

                                    {/* Zone */}
                                    <SearchableSelect
                                        label="Zone"
                                        options={filteredZones}
                                        value={watch('zone')}
                                        onChange={(val) => setValue('zone', val)}
                                        error={errors.zone?.message as string}
                                        placeholder="Pick Zone"
                                        disabled={!selectedCity}
                                    />

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Name</label>
                                        <input
                                            {...register('street')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium text-sm"
                                            placeholder="e.g. Al-Hamra St."
                                        />
                                        {errors.street && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.street.message as string}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Building Number</label>
                                        <input
                                            {...register('buildingNumber')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium text-sm"
                                            placeholder="e.g. 42"
                                        />
                                        {errors.buildingNumber && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.buildingNumber.message as string}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor</label>
                                        <input
                                            {...register('floorNumber')}
                                            type="number"
                                            placeholder='e.g. 12'
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apartment</label>
                                        <input
                                            type="number"
                                            placeholder='e.g. 12'
                                            {...register('apartmentNumber')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                        <input
                                            {...register('uniqueIdentifier')}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium text-sm"
                                            placeholder="e.g. Near Mosque"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isAdding || isUpdating}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-primary/20"
                                    >
                                        {isAdding || isUpdating ? <Loader2 className="animate-spin" size={24} /> : editingAddress ? 'Update Base' : 'Save Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation */}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setAddressToDelete(null);
                }}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
