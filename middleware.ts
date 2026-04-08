import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isProtectedDashboard = request.nextUrl.pathname.startsWith('/admin') || 
                               request.nextUrl.pathname.startsWith('/teacher') || 
                               request.nextUrl.pathname.startsWith('/student');

  // If user is trying to access a protected dashboard route, but is NOT logged in.
  if (isProtectedDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in (e.g. going to /login) route them to their respective dashboard
  if (user && isAuthRoute) {
    const role = user.user_metadata?.role || 'admin'; // Default to admin for legacy users
    
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    } else if (role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Role-Based Guarding
  if (user && isProtectedDashboard) {
    const role = user.user_metadata?.role || 'admin';
    
    // Prevent Students from entering Admin or Teacher zones
    if (role === 'student' && !request.nextUrl.pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    
    // Prevent Teachers from entering Admin or Student zones
    if (role === 'teacher' && !request.nextUrl.pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    
    // Allow Admins to access anything locally for debugging, or restrict to /admin
    if (role === 'admin' && !request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
