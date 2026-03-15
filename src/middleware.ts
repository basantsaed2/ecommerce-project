import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. لازم نستخدم كلمة export function middleware
export function middleware(request: NextRequest) {
    // جلب التوكن من الكوكيز (لأن الميدل وير بيشتغل سيرفر مش لوكال ستورج)
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // المسارات اللي محتاجة حماية
    const protectedRoutes = ['/orders', '/checkout', '/favourite', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // لو المسار محمي ومفيش توكن، رجعه لصفحة اللوجن
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// 2. تحديد المسارات اللي الميدل وير يشتغل عليها (اختياري بس بيحسن الأداء)
export const config = {
    matcher: ['/orders/:path*', '/checkout/:path*', '/favourite/:path*', '/profile/:path*'],
};