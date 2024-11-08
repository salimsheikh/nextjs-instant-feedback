// middleware.ts

import {NextRequest, NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
export {default} from 'next-auth/middleware'

// Define protected paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/settings']; // Example paths

export async function middleware(request: NextRequest) {
     const token = await getToken({req: request});

     const url = request.nextUrl;

    // Continue with the request if the user is authenticated or the path is not protected
    return NextResponse.redirect(new URL('/home', request.url));
}

// Define paths where middleware should be applied
export const config = {
   // matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'], // Adjust based on your app

   matcher: ['/signin', 'signup',"/",'/dashboard/:path*', 'verify/:path*'
    ], // Adjust based on your app
};
