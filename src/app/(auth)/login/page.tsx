"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Loader2, Phone } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import DynamicBanner from '@/components/common/DynamicBanner';
import { useDispatch } from 'react-redux';
import { setCredentials, setIncompleteUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
    identifier: z.string().min(1, "Email or phone number is required"),
    password: z.string().optional(),
});

export default function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: login, isPending } = usePost(
        '/auth/login',
        ['user'],
        (response: any) => response?.data?.requires_otp ? 'Verification code sent!' : 'Welcome back!'
    );

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const identifier = watch("identifier");

    const onSubmit = (formData: any) => {
        login(formData, {
            onSuccess: (response: any) => {
                // Handle both flat and nested 'data' structures from SuccessResponse
                const data = response.data || response;
                const action = data.action_required;

                if (action === "GO_TO_OTP_SCREEN" || data.requires_otp) {
                    dispatch(setIncompleteUser({
                        identifier: formData.identifier,
                        status: data.status
                    } as any));
                    router.push('/verify-otp');
                    return;
                }

                if (action === "SHOW_PASSWORD_FIELD") {
                    setShowPassword(true);
                    return;
                }

                if (action === "GO_TO_HOME" || data.token) {
                    dispatch(setCredentials({
                        user: data.user,
                        token: data.token
                    }));
                    router.push('/');
                }
            },
            onError: (error: any) => {
                const data = error.response?.data;
                // Check all possible places for the action and message
                const action = data?.action_required || data?.details?.action_required ||
                    data?.error?.action_required || data?.error?.details?.action_required;
                const errorMsg = data?.message || data?.error?.message || "";

                if (action === "GO_TO_SIGNUP" || errorMsg.toLowerCase().includes("not found")) {
                    router.push(`/signup?identifier=${encodeURIComponent(identifier || '')}`);
                    return;
                }

                if (action === "SHOW_PASSWORD_FIELD") {
                    setShowPassword(true);
                    return;
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <DynamicBanner
                        pageName="login"
                        fallbackImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Ecommerce Experience"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 text-white max-w-md">
                    <h2 className="text-5xl font-black leading-tight mb-6 tracking-tighter">
                        Elevate Your <br /> Shopping <span className="text-secondary italic">Experience.</span>
                    </h2>
                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                        Join our community and explore thousands of premium products with exclusive offers tailored for you.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-primary mb-8 inline-block hover:opacity-80 transition">
                            STORE<span className="text-secondary">.</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sign In</h1>
                        <p className="text-gray-500 mt-3 font-medium">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email or Phone Number</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("identifier")}
                                    type="text"
                                    disabled={showPassword}
                                    placeholder="email or phone number"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.identifier ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium ${showPassword ? 'opacity-50' : ''}`}
                                />
                                {showPassword && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(false)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary hover:underline"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>
                            {errors.identifier && <p className="text-red-500 text-xs font-bold ml-1">{errors.identifier.message as string}</p>}
                        </div>

                        {showPassword && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-gray-700">Password</label>
                                    <Link href="/forgot-password" className="text-xs font-black text-secondary hover:text-primary transition-colors">FORGOT PASSWORD?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                    <input
                                        {...register("password")}
                                        type="password"
                                        autoFocus
                                        placeholder="••••••••"
                                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password.message as string}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 mt-4"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>{showPassword ? 'Sign In' : 'Continue'} <ArrowRight size={22} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center border-t border-gray-100 pt-8">
                        <p className="text-gray-500 font-semibold italic">
                            New to our store?
                            <Link href="/signup" className="text-secondary font-black ml-2 hover:underline tracking-tighter">
                                CREATE AN ACCOUNT
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}