
import { auth } from "@/auth"
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRoles = (req.auth?.user as any)?.roles || [];
    const isSystemAdmin = userRoles.some((role: any) => role.name === 'System_Admin');
    const { nextUrl } = req;

    if (nextUrl.pathname.startsWith('/admin')) {
        console.log('Middleware Admin Check:', {
            isLoggedIn,
            email: req.auth?.user?.email,
            isSuperAdmin: (req.auth?.user as any)?.is_super_admin,
            roles: userRoles
        });

        if (!isLoggedIn) {
            return NextResponse.redirect(new URL(`/?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
        }
        if (!isSystemAdmin && !(req.auth?.user as any)?.is_super_admin) {
            return NextResponse.redirect(new URL(`/?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
        }
    }

    // Protect /events and /clubs
    if ((nextUrl.pathname.startsWith('/events') || nextUrl.pathname.startsWith('/clubs')) && !isLoggedIn) {
        return NextResponse.redirect(new URL(`/?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
    }
    return NextResponse.next();
})

export const config = {
    matcher: ['/admin/:path*', '/events/:path*', '/clubs/:path*'],
};
