// app/api/auth/debug/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const redirectUri = `${baseUrl}/api/auth/github`;
  
  return NextResponse.json({
    message: "Debug GitHub OAuth",
    baseUrl,
    redirectUri,
    expected: "https://notes-to-self.vercel.app/api/auth/github",
    matches: redirectUri === "https://notes-to-self.vercel.app/api/auth/github",
    clientId: process.env.GITHUB_CLIENT_ID ? "Set" : "Missing"
  });
}
