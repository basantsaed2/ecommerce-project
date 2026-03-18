import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCookie, deleteCookie, setCookie } from 'cookies-next';

interface AuthState {
    user: any | null;
    token: string | null;
    incompleteUser: {
        identifier: string;
        userId?: string;
        email?: string;
        phone_number?: string;
        name?: string;
    } | null;
}

const getInitialAuth = (): AuthState => {
    try {
        const token = getCookie('token');
        const user = getCookie('user');
        if (!token) return { token: null, user: null, incompleteUser: null };
        return {
            token: token as string,
            user: user ? JSON.parse(user as string) : null,
            incompleteUser: null
        };
    } catch (error) {
        return { token: null, user: null, incompleteUser: null };
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuth(),
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.incompleteUser = null;
            setCookie('token', action.payload.token);
            setCookie('user', JSON.stringify(action.payload.user));
        },
        setIncompleteUser: (state, action: PayloadAction<AuthState['incompleteUser']>) => {
            state.incompleteUser = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.incompleteUser = null;
            deleteCookie('token');
            deleteCookie('user');
        }
    }
});

export const { setCredentials, setIncompleteUser, logout } = authSlice.actions;
export default authSlice.reducer;