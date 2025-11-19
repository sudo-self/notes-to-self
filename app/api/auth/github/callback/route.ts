import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return NextResponse.json({ error: "Failed to get access token" }, { status: 400 });

  // Fetch user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${tokenData.access_token}` },
  });

  const userData = await userRes.json();

  console.log("GitHub user data received:", {
    id: userData.id,
    login: userData.login,
    avatar_url: userData.avatar_url
  });

  // FIX: Use the correct property names that match your frontend
  const user = {
    id: userData.id.toString(),
    login: userData.login, // Frontend expects 'login' not 'username'
    avatar_url: userData.avatar_url // Frontend expects 'avatar_url' not 'avatar'
  };

  // Set user cookie
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: "user",
    value: JSON.stringify(user),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  console.log("User cookie set with:", user);
  return response;
}





