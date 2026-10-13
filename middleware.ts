import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, leerSesionToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESION)?.value;
  const sesion = await leerSesionToken(token);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!sesion) return NextResponse.redirect(new URL("/", request.url));
    if (sesion.rol !== "ADMIN") {
      return NextResponse.redirect(new URL("/operario", request.url));
    }
  }

  if (pathname.startsWith("/operario")) {
    if (!sesion) return NextResponse.redirect(new URL("/", request.url));
    if (sesion.rol !== "OPERARIO") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (pathname === "/" && sesion) {
    const destino = sesion.rol === "ADMIN" ? "/admin" : "/operario";
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/operario/:path*"],
};
