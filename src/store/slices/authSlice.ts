import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCookie, deleteCookie, setCookie } from 'cookies-next';

const getInitialAuth = () => {
    try {
        const token = getCookie('token');
        const user = getCookie('user');
        if (!token) return { token: null, user: null };
        return {
            token: token as string,
            user: user ? JSON.parse(user as string) : null
        };
    } catch (error) {
        return { token: null, user: null };
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialAuth(),
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            setCookie('token', action.payload.token);
            setCookie('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            deleteCookie('token');
            deleteCookie('user');
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;