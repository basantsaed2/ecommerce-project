import { setCookie, getCookie } from 'cookies-next';

export const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
        setCookie('sessionId', sessionId, { maxAge: 60 * 60 * 24 * 30, path: '/' });
    } else {
        if (!getCookie('sessionId')) {
            setCookie('sessionId', sessionId, { maxAge: 60 * 60 * 24 * 30, path: '/' });
        }
    }
    return sessionId;
};
