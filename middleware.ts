import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // 1. Domain Migration: Force redirect from ANY .xyz variant to .com
  if (host.includes('hexescortsug.xyz')) {
    const newUrl = new URL(pathname, 'https://www.hexescortsug.com');
    // Keep search params (like ?ref=...)
    request.nextUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(newUrl, 301);
  }

  // 2. WWW Enforcement: Redirect hexescortsug.com to www.hexescortsug.com
  if (host === 'hexescortsug.com') {
    const newUrl = new URL(pathname, 'https://www.hexescortsug.com');
    request.nextUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(newUrl, 301);
  }

  // Protect the admin route — redirect to home if not authenticated via Supabase session cookie
  if (pathname.startsWith('/admin-panel')) {
    return NextResponse.redirect(new URL('/hx-ctrl-7k9', request.url));
  }

  // SEO Redirect: Old /location/ routes to new /escorts-in/ routes
  if (pathname.startsWith('/location/')) {
    const newPath = pathname.replace('/location/', '/escorts-in/');
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-panel/:path*', 
    '/hx-ctrl-7k9/:path*',
    '/:path*' // Match all to enable the rewrite
  ], 
};

