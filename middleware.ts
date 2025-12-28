import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes except auth routes, public assets, etc.
  matcher: [
    "/((?!api/auth|api/register|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};