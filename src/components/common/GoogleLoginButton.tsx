"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { usePost } from "@/hooks/usePost";
import { useDispatch } from "react-redux";
import { setCredentials, setIncompleteUser } from "@/store/slices/authSlice";
import { fetchCart } from "@/store/slices/cartSlice";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const { mutate: loginWithGoogle } = usePost("/auth/google-login", ["user"]);

  const processGoogleCredential = useCallback(
    (id_token: string) => {
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
    },
    [dispatch, loginWithGoogle, router]
  );

  const initializeAndRenderGoogleButton = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            processGoogleCredential(response.credential);
          } else {
            toast.error("No credential token returned by Google");
          }
        },
      });

      if (buttonRef.current) {
        buttonRef.current.replaceChildren();

        let buttonText: "signin_with" | "signup_with" | "continue_with" = "continue_with";
        const lowerText = text.toLowerCase();
        if (lowerText.includes("sign in") || lowerText.includes("signin")) {
          buttonText = "signin_with";
        } else if (lowerText.includes("sign up") || lowerText.includes("signup")) {
          buttonText = "signup_with";
        }

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: buttonText,
          shape: "pill",
          width: 380,
        });
      }
    } catch (err) {
      console.error("Error initializing Google Identity Services:", err);
    }
  }, [text, processGoogleCredential]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      initializeAndRenderGoogleButton();
    }
  }, [initializeAndRenderGoogleButton]);

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    initializeAndRenderGoogleButton();
  };

  return (
    <div className={`w-full flex justify-center flex-col items-center gap-3 ${className}`}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      {isAuthenticating && (
        <div className="w-full bg-white border-2 border-gray-200 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 text-gray-500 font-bold">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span>Authenticating...</span>
        </div>
      )}
      {!scriptLoaded && !isAuthenticating && (
        <div className="w-full bg-white border-2 border-gray-200 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 text-gray-400 font-medium">
          <Loader2 className="animate-spin text-primary" size={18} />
          <span>Loading Google Sign-In...</span>
        </div>
      )}
      <div
        className={`w-full justify-center min-h-[44px] ${
          isAuthenticating || !scriptLoaded ? "hidden" : "flex"
        }`}
        ref={buttonRef}
      />
    </div>
  );
}