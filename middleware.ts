
import { auth } from "@/auth"
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isSuperAdmin = (req.auth?.user as any)?.is_super_admin;
    const { nextUrl } = req;

    if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/api/auth/signin', nextUrl));
        }
        if (!isSuperAdmin) {
            return NextResponse.redirect(new URL('/', nextUrl));
        }
    }
    return NextResponse.next();
})

export const config = {
    matcher: ['/admin/:path*'],
};
