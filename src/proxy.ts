import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authMiddleware = withAuth(
	function middleware(req) {
		const token = req.nextauth.token;
		const pathname = req.nextUrl.pathname;

		// Redirect logged-in users away from auth pages (like /login)
		if (token && pathname === "/login") {
			return NextResponse.redirect(new URL("/portal/dashboard", req.url));
		}
		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const pathname = req.nextUrl.pathname;
				// Allow access to /login so the middleware function can run and check if authenticated
				if (pathname === "/login") {
					return true;
				}
				// Protect matched routes (i.e. "/portal/:path*")
				return !!token;
			},
		},
		pages: {
			signIn: "/login",
			error: "/login",
		},
	}
);

export const proxy = authMiddleware;
export default authMiddleware;

export const config = {
	matcher: ["/portal/:path*", "/login"],
};
