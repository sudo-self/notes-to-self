// File: /app/api/auth/github/callback/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json",
        "User-Agent": "Your-App-Name" 
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    
    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 400 });
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Your-App-Name",
        "Accept": "application/json"
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 400 });
    }

    const userData = await userRes.json();

    const user = {
      id: userData.id.toString(),
      login: userData.login,
      avatar_url: userData.avatar_url 
    };

    if (!user.id || !user.login) {
      return NextResponse.json({ error: "Incomplete user data from GitHub" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: "user",
      value: JSON.stringify(user),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL("/", req.url));
    
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
