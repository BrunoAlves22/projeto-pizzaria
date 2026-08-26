import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchApi } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { User } from "@/lib/types";

const COOKIE_NAME = "token_pizzaria";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const user = await fetchApi<User>("/me", {
      token,
      cache: "no-store",
    });

    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.error("Error validating user in proxy:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
