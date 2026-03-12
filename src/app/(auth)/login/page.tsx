"use client";
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { mutate: login, isPending } = usePost(
        '/api/store/auth/login',
        ['user'],
        (response: any) => `Welcome back, ${response.data.user.name}! 👋`
    );

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (formData: any) => {
        login(formData, {
            onSuccess: (response: any) => {
                const userData = response.data.user;
                const token = response.data.token;

                if (token) {
                    dispatch(setCredentials({
                        user: userData,
                        token: token
                    }));

                    router.push('/');
                } else {
                    console.error("Token missing in API response structure");
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
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
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="name@company.com"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <Link href="/forgot-password" className="text-xs font-black text-secondary hover:text-primary transition-colors">FORGOT PASSWORD?</Link>
                            </div>
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
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 mt-4"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Sign In <ArrowRight size={22} /></>
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