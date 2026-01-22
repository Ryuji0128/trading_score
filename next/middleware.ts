// 認証機能は後から実装予定
// export { auth as middleware } from "@/lib/auth";

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 一旦、何もしないミドルウェア
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// 必要に応じてパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};