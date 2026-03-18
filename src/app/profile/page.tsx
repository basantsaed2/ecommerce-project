"use client";
import React, { useState, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { useUpdate } from '@/hooks/useUpdate';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    User, Mail, Phone, Lock, Camera,
    Save, Loader2, Calendar, ShieldCheck,
    ChevronRight, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredentials, logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

import AddressManager from '@/components/modules/profile/AddressManager';

const profileSchema = z.object({
    name: z.string().min(3, "name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
});

type Tab = 'profile' | 'addresses';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);

    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    const { data: profileResponse, isLoading: isFetching } = useGet<any>(
        ['profile'],
        '/auth/get-profile',
        { enabled: !!token && activeTab === 'profile' }
    );

    const { mutate: updateProfile, isPending: isUpdating } = useUpdate(
        '/auth/edit-profile',
        ['profile'],
        'Profile updated successfully'
    );

    const user = profileResponse?.data?.user || currentUser;

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user && activeTab === 'profile') {
            reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || user.phone_number || '',
            });
            if (user.imagePath) setImagePreview(user.imagePath);
        }
    }, [user, reset, activeTab]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setBase64Image(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (formData: any) => {
        const payload: any = { ...formData };
        if (base64Image) payload.image = base64Image;
        if (!payload.password) delete payload.password;

        updateProfile({
            id: user?._id,
            updatedData: payload
        }, {
            onSuccess: (response: any) => {
                if (response?.data?.user) {
                    dispatch(setCredentials({
                        user: response.data.user,
                        token: token!
                    }));
                }
            }
        });
    };

    if (!token) return null;

    return (
        <div className="container min-h-screen bg-gray-50/50 py-6">
            <div className="w-full">
                {/* Header Section */}
                <div className="mb-10 flex flex-row items-end justify-between gap-6">
                    <div>
                        {/* <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-widest mb-2">
                            <ShieldCheck size={16} />
                            Account Settings
                        </div> */}
                        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
                            Your <span className="italic text-secondary">Profile.</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => {
                            dispatch(logout());
                            router.push('/login');
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Card */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-secondary/10" />

                            <div className="relative flex flex-col items-center text-center">
                                {/* Avatar Upload */}
                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-gray-300" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-lg hover:scale-110 active:scale-90 border-2 border-white">
                                        <Camera size={18} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>

                                <h2 className="text-2xl font-black text-primary tracking-tight mb-1">
                                    {user?.name || 'User'}
                                </h2>
                                <p className="text-gray-400 font-medium text-sm mb-6 flex items-center gap-2 justify-center">
                                    <Calendar size={14} />
                                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                                </p>

                                <div className="w-full pt-6 border-t border-gray-50 flex justify-between items-center text-sm">
                                    <div className="text-center flex-1">
                                        <div className="font-black text-primary">0</div>
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Orders</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100" />
                                    <div className="text-center flex-1">
                                        <div className="font-black text-primary">0</div>
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Reviews</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-primary rounded-[30px] p-6 text-white shadow-xl shadow-primary/20">
                            <h3 className="font-black mb-4 uppercase text-xs tracking-widest opacity-60">Preferences</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group ${activeTab === 'profile' ? 'bg-white/10' : ''}`}
                                >
                                    <span className="font-bold">Profile Info</span>
                                    <ChevronRight size={18} className={`opacity-40 transition-transform ${activeTab === 'profile' ? 'translate-x-1' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group ${activeTab === 'addresses' ? 'bg-white/10' : ''}`}
                                >
                                    <span className="font-bold">Shipping Addresses</span>
                                    <ChevronRight size={18} className={`opacity-40 transition-transform ${activeTab === 'addresses' ? 'translate-x-1' : ''}`} />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 opacity-50 cursor-not-allowed">
                                    <span className="font-bold">Payment Methods</span>
                                    <ChevronRight size={18} className="opacity-0" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[600px]">
                            {activeTab === 'profile' ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    <section>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">
                                                01
                                            </div>
                                            <h3 className="text-xl font-black text-primary tracking-tight">Personal Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">name</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                                    <input
                                                        {...register("name")}
                                                        type="text"
                                                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                                    />
                                                </div>
                                                {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                                    <input
                                                        {...register("email")}
                                                        type="email"
                                                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                                    />
                                                </div>
                                                {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email.message as string}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                                    <input
                                                        {...register("phone")}
                                                        type="text"
                                                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                                    />
                                                </div>
                                                {errors.phone && <p className="text-red-500 text-xs font-bold ml-1">{errors.phone.message as string}</p>}
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-black">
                                                02
                                            </div>
                                            <h3 className="text-xl font-black text-primary tracking-tight">Security</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Change Password (Optional)</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                                <input
                                                    {...register("password")}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                                />
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password.message as string}</p>}
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider ml-1 mt-2">Leave blank to keep existing password</p>
                                        </div>
                                    </section>

                                    <div className="pt-6 border-t border-gray-50">
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={22} />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={22} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <AddressManager />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
