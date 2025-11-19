// FILE: app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json(null);
    }

    const user = JSON.parse(userCookie);

    const validatedUser = {
      id: String(user.id), 
      login: user.login,
      avatar_url: user.avatar_url
    };
    
    return NextResponse.json(validatedUser);
  } catch (error) {
    return NextResponse.json(null);
  }
};
