import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect ABM routes
  if (request.nextUrl.pathname.startsWith("/abm")) {
    const token =
      request.headers.get("x-abm-token") ||
      request.cookies.get("abm_token")?.value;

    const expectedToken = process.env.ABM_TOKEN;

    if (!token || token !== expectedToken) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": "Bearer realm=ABM",
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/abm/:path*"],
};
