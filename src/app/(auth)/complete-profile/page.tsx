"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Camera, ArrowRight, Loader2 } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const completeProfileSchema = z.object({
    name: z.string().min(2, "name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function CompleteProfilePage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const incompleteUser = useSelector((state: any) => state.auth.incompleteUser);

    useEffect(() => {
        if (!incompleteUser) {
            router.push('/login');
        }
    }, [incompleteUser, router]);

    const { mutate: completeProfile, isPending } = usePost(
        '/auth/complete-profile',
        ['user'],
        'Profile activated successfully! Welcome to STORE.'
    );

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            name: incompleteUser?.name || '',
            email: incompleteUser?.email || '',
        }
    });

    const onSubmit = (formData: any) => {
        completeProfile({
            userId: incompleteUser?.userId,
            ...formData
        }, {
            onSuccess: (response: any) => {
                const data = response.data || response;
                const action = data.action_required || data.details?.action_required;
                if (action === "GO_TO_HOME" || data.token) {
                    dispatch(setCredentials({
                        user: data.user,
                        token: data.token
                    }));
                    router.push('/');
                }
            }
        });
    };

    if (!incompleteUser) return null;

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1517677202341-0ca613d05e3a?q=80&w=2070&auto=format&fit=crop"
                        alt="Join Us"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                </div>
                <div className="relative z-10 text-white max-w-md">
                    <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-5xl font-black leading-tight mb-6 tracking-tighter">
                        Complete Your <br /> <span className="text-secondary italic">Profile.</span>
                    </h2>
                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                        Just a few more details to unlock the full shopping experience and connect your history.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-primary mb-8 inline-block hover:opacity-80 transition">
                            STORE<span className="text-secondary">.</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Set Your Password</h1>
                        <p className="text-gray-500 mt-3 font-medium">Hello <span className="text-primary font-bold">{incompleteUser.identifier}</span>, let's finish your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="Choose a name"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs font-bold ml-1">{errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
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
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Create Password</label>
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium`}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs font-bold ml-1">{errors.confirmPassword.message as string}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 mt-6"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Activate Account <ArrowRight size={22} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
