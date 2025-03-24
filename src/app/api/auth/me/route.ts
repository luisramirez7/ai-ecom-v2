import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from 'jose';
import type { User } from "@prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/auth/me - Checking auth status");
    
    const token = request.cookies.get('token')?.value;
    console.log("Token from cookie starts with:", token ? token.substring(0, 20) : 'no token');

    if (!token) {
      console.log("No token found in cookies");
      const response = NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
      response.cookies.delete('token');
      return response;
    }

    try {
      // Verify token
      console.log("Verifying token...");
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      console.log("Token verified for user:", payload.email);

      // Get user from database
      console.log("Getting user data for:", payload.email);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          email: true,
          name: true,
        },
      }) as Pick<User, 'id' | 'email' | 'name'> | null;

      if (!user) {
        console.log("User not found in database");
        const response = NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
        response.cookies.delete('token');
        return response;
      }

      console.log("Auth check successful for:", user.email);
      
      // Create response with user data
      const response = NextResponse.json(user);
      
      // Refresh the token
      const newToken = await new jose.SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
      
      console.log("New token starts with:", newToken.substring(0, 20));
      
      // Set the refreshed token
      response.cookies.set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      console.log("Token verification failed:", error);
      // Token is invalid or expired
      const response = NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
      response.cookies.delete('token');
      return response;
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json(
      { error: "Failed to check auth status" },
      { status: 500 }
    );
  }
} 