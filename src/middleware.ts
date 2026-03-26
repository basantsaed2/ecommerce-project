import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. لازم نستخدم كلمة export function middleware
export function middleware(request: NextRequest) {
    // جلب التوكن من الكوكيز (لأن الميدل وير بيشتغل سيرفر مش لوكال ستورج)
    const token = request.cookies.get('token')?.value;
    const sessionId = request.cookies.get('sessionId')?.value;
    const { pathname } = request.nextUrl;

    // المسارات اللي محتاجة حماية كاملة بتوكن
    const strictProtectedRoutes = ['/orders', '/favourite', '/profile'];
    const isStrictProtected = strictProtectedRoutes.some(route => pathname.startsWith(route));

    // مسارات يسمح للجيست (session id) والمسجل (token)
    const guestAllowedRoutes = ['/checkout'];
    const isGuestAllowed = guestAllowedRoutes.some(route => pathname.startsWith(route));

    if (isStrictProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isGuestAllowed && !token && !sessionId) {
        return NextResponse.redirect(new URL('/cart', request.url));
    }

    return NextResponse.next();
}

// 2. تحديد المسارات اللي الميدل وير يشتغل عليها (اختياري بس بيحسن الأداء)
export const config = {
    matcher: ['/orders/:path*', '/checkout/:path*', '/favourite/:path*', '/profile/:path*'],
};