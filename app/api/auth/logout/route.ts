import { NextResponse } from "next/server";
import { signOut } from "@/lib/services/auth.service";

export async function POST() {
  try {
    await signOut();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to log out. Please try again.",
      },
      { status: 500 }
    );
  }
}