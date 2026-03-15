"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setIncompleteUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function VerifyOtpPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const incompleteUser = useSelector((state: any) => state.auth.incompleteUser);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (!incompleteUser) {
            router.push('/login');
        }
    }, [incompleteUser, router]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const { mutate: verifyOtp, isPending: isVerifying } = usePost(
        '/api/store/auth/verify-otp',
        ['user'],
        'OTP Verified Successfully!'
    );

    const { mutate: resendOtp, isPending: isResending } = usePost(
        '/api/store/auth/resend-otp',
        [],
        'New OTP sent to your email/phone'
    );

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(otpSchema),
    });

    const onSubmit = (formData: any) => {
        verifyOtp({
            identifier: incompleteUser?.identifier,
            otp: formData.otp
        }, {
            onSuccess: (response: any) => {
                const data = response.data || response;
                const action = data.action_required || data.details?.action_required;

                if (action === "GO_TO_COMPLETE_PROFILE" || data.complete_profile_required) {
                    const userData = data.user_data || data.user;
                    dispatch(setIncompleteUser({
                        ...incompleteUser,
                        userId: userData.id || userData.userId || userData._id,
                        email: userData.email,
                        phone_number: userData.phone_number,
                        username: userData.username,
                        imagePath: userData.imagePath
                    }));
                    router.push('/complete-profile');
                } else if (action === "GO_TO_HOME" || data.token) {
                    dispatch(setCredentials({
                        user: data.user,
                        token: data.token
                    }));
                    router.push('/');
                }
            }
        });
    };

    const handleResend = () => {
        if (timer > 0) return;
        resendOtp({ identifier: incompleteUser?.identifier });
        setTimer(60);
    };

    if (!incompleteUser) return null;

    return (
        <div className="min-h-screen flex bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"
                        alt="Security"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                </div>
                <div className="relative z-10 text-white max-w-md">
                    <ShieldCheck className="w-24 h-24 text-secondary mb-8" />
                    <h2 className="text-5xl font-black leading-tight mb-6 tracking-tighter">
                        Secure Your <br /> <span className="text-secondary italic">Account.</span>
                    </h2>
                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                        Verification helps us ensure that your account remains safe and exclusively accessible by you.
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-primary mb-8 inline-block hover:opacity-80 transition">
                            STORE<span className="text-secondary">.</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Verify OTP</h1>
                        <p className="text-gray-500 mt-3 font-medium">
                            We've sent a 6-digit code to <span className="text-primary font-bold">{incompleteUser.identifier}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">6-Digit Code</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                <input
                                    {...register("otp")}
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${errors.otp ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all font-medium tracking-[0.5em] text-center text-xl`}
                                />
                            </div>
                            {errors.otp && <p className="text-red-500 text-xs font-bold ml-1">{errors.otp.message as string}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 mt-4"
                        >
                            {isVerifying ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Verify & Continue <ArrowRight size={22} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center border-t border-gray-100 pt-8">
                        <p className="text-gray-500 font-semibold italic mb-4">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={timer > 0 || isResending}
                            className={`flex items-center justify-center gap-2 mx-auto font-black tracking-tighter transition ${timer > 0 || isResending ? 'text-gray-300' : 'text-secondary hover:text-primary'}`}
                        >
                            {isResending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <RefreshCw size={20} className={timer > 0 ? '' : 'animate-pulse'} />
                            )}
                            RESEND CODE {timer > 0 && `(${timer}s)`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
