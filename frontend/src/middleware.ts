import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;

        // Protect /admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
            if (!token || token.role !== "ADMIN") {
                // Redirect non-admins to the homepage securely
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/checkout", "/profile", "/my-list"]
};
