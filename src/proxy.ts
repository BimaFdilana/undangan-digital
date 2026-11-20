import { NextResponse, type NextRequest } from "next/server";

// Pemeriksaan cepat: tanpa cookie sesi, arahkan ke /login.
// Otorisasi sebenarnya (peran + kepemilikan undangan) tetap di lapisan data (lib/auth, lib/dal).
export function proxy(request: NextRequest) {
  if (!request.cookies.get("undangan_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
