import axios from 'axios';

const axiosInstance = axios.create({
    // استخدام NEXT_PUBLIC لضمان وصول الفرونت إيند للرابط
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15000, // إضافة timeout مهم جداً لحالات ضعف الإنترنت
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        // حماية الـ LocalStorage من الـ Server-Side Error
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
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
                console.error('Session expired. Redirecting...');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;