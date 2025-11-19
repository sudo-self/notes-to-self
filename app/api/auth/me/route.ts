import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    console.log("User cookie found:", !!userCookie);
    
    if (!userCookie) {
      console.log("No user cookie - returning null");
      return NextResponse.json(null);
    }

    try {
      const user = JSON.parse(userCookie);
      console.log("Parsed user:", { id: user.id, login: user.login });
      
      // FIX: Ensure the user object has the expected structure
      const validatedUser = {
        id: user.id,
        login: user.login,
        avatar_url: user.avatar_url || "./avatar-192.png"
      };
      
      return NextResponse.json(validatedUser);
    } catch (err) {
      console.error("Failed to parse user cookie:", err);
      console.error("Cookie value that failed:", userCookie);
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(null);
  }
};

