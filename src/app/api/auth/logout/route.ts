import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: false, // Set to false for local development
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
} 