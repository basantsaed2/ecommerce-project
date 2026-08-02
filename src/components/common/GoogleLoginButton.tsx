"use client";

import { useState } from "react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { usePost } from "@/hooks/usePost";
import { useDispatch } from "react-redux";
import { setCredentials, setIncompleteUser } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

export default function GoogleLoginButton({
  text = "Continue with Google",
  className = "",
}: GoogleLoginButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { mutate: loginWithGoogle } = usePost("/auth/google-login", ["user"]);

  const processGoogleCredential = (id_token: string) => {
    if (!id_token) {
      toast.error("Failed to receive credentials from Google");
      return;
    }

    setIsAuthenticating(true);
    loginWithGoogle(
      { id_token },
      {
        onSuccess: (res: any) => {
          setIsAuthenticating(false);
          const data = res?.data || res;
          const action = data?.action_required;

          if (action === "GO_TO_OTP_SCREEN" || data?.requires_otp) {
            dispatch(
              setIncompleteUser({
                identifier: data?.email || data?.identifier || "",
                status: data?.status,
              } as any)
            );
            toast.info("Verification required");
            router.push("/verify-otp");
            return;
          }

          if (action === "COMPLETE_PROFILE" || data?.incomplete_user) {
            dispatch(setIncompleteUser(data?.user || data?.incomplete_user));
            toast.info("Please complete your profile");
            router.push("/complete-profile");
            return;
          }

          if (data?.token) {
            dispatch(
              setCredentials({
                user: data.user || {},
                token: data.token,
              })
            );
            dispatch(fetchCart());
            toast.success("Successfully logged in with Google!");
            router.push("/");
          } else {
            toast.error(data?.message || "Google authentication failed");
          }
        },
        onError: (error: any) => {
          setIsAuthenticating(false);
          const errorMsg =
            error?.response?.data?.message ||
            error?.response?.data?.error?.message ||
            "Google sign-in failed. Please try again.";
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <div className={`w-full flex justify-center flex-col items-center gap-3 ${className}`}>
      {isAuthenticating ? (
        <div className="w-full bg-white border-2 border-gray-200 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 text-gray-500 font-bold">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span>Authenticating...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                processGoogleCredential(credentialResponse.credential);
              } else {
                toast.error("No credential token returned by Google");
              }
            }}
            onError={() => {
              toast.error("Google Login Failed");
            }}
            size="large"
            theme="outline"
            shape="pill"
            width="380"
          />
        </div>
      )}
    </div>
  );
}