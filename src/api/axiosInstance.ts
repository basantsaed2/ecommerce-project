import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import { getSessionId } from '@/utils/session';

const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/store`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('token');
        if (config.headers) {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            const sessionId = getSessionId();
            if (sessionId) {
                config.headers['x-session-id'] = sessionId;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                const isLoginPage = window.location.pathname === '/login';
                if (!isLoginPage) {
                    console.error('Session expired. Redirecting...');
                    deleteCookie('token');
                    deleteCookie('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;