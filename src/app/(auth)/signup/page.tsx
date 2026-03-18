"use client";
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const signupSchema = z.object({
    name: z.string().min(2, "name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is too short"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const identifier = searchParams.get('identifier');

    const { mutate: signup, isPending } = usePost(
        '/auth/signup',
        [],
        () => 'Account created successfully! Please sign in.'
    );

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(signupSchema),
    });

    useEffect(() => {
        if (identifier) {
            if (identifier.includes('@')) {
                setValue('email', identifier);
            } else {
                setValue('phone', identifier);
            }
        }
    }, [identifier, setValue]);

    const onSubmit = (formData: any) => {
        signup(formData, {
            onSuccess: (data: any) => {
                if (data.action_required === "GO_TO_LOGIN") {
                    router.push(`/login?identifier=${encodeURIComponent(formData.phone)}`);
                } else {
                    router.push('/login');
                }
            },
            onError: (error: any) => {
                const data = error.response?.data;
                const action = data?.action_required || data?.details?.action_required ||
                    data?.error?.action_required || data?.error?.details?.action_required;
                const message = data?.message || data?.error?.message || "";

                // If user exists or action says go to login, redirect to login
                if (action === "GO_TO_LOGIN" || message.includes("existing account") || message.includes("already exists")) {
                    router.push(`/login?identifier=${encodeURIComponent(formData.phone || formData.email || '')}`);
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=2097&auto=format&fit=crop"
                        alt="Ecommerce Experience"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 p-16 flex flex-col justify-between text-white h-full max-w-xl">
                    <div className="mt-20">
                        <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
                            JOIN THE <br /> <span className="text-secondary italic">REVOLUTION.</span>
                        </h2>
                        <p className="text-lg opacity-80 leading-relaxed font-medium">
                            Create an account and unlock a world of exclusive fashion and tech deals tailored just for you.
                        </p>
                    </div>
                    <div className="flex gap-8 mb-20">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                            <p className="text-3xl font-black mb-1">10k+</p>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Active Users</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                            <p className="text-3xl font-black mb-1">500+</p>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Global Brands</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-primary mb-8 inline-block hover:opacity-80 transition">
                            STORE<span className="text-secondary">.</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Get Started</h1>
                        <p className="text-gray-500 mt-3 font-medium">Create your account in seconds.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="name"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="Email Address"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email.message as string}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("phone")}
                                    type="tel"
                                    placeholder="Phone Number"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs font-bold ml-1">{errors.phone.message as string}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="Password"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password.message as string}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 mt-6"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Create Account <ArrowRight size={22} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-t border-gray-100 pt-8">
                        <p className="text-gray-500 font-semibold italic">
                            Already a member?
                            <Link href="/login" className="text-secondary font-black ml-2 hover:underline tracking-tighter">
                                SIGN IN
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}