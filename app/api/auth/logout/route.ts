import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "user",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
  });
  return res;
}

