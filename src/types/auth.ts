export interface User {
    _id: string;
    name: string;
    email?: string;
    phone_number: string;
    imagePath?: string;
    is_profile_complete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    user?: User;
    token?: string;
    requires_otp?: boolean;
    status?: 'INCOMPLETE_PROFILE';
    complete_profile_required?: boolean;
    action_required?: string;
    user_data?: any;
}

export interface LoginRequest {
    identifier: string; // email, phone or name
    password?: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    phone: string;
    password?: string;
    image?: string; // base64
}

export interface VerifyOtpRequest {
    identifier: string;
    otp: string;
}

export interface CompleteProfileRequest {
    userId: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    image?: string; // base64
}

export interface ResendOtpRequest {
    identifier: string;
}

export interface UpdateProfileRequest {
    userId: string;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    image?: string; // base64
}
