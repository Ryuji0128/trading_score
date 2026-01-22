"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function googleAuthenticate() {
  const errorMessages: string[] = [];
  try {
    await signIn("google", { redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      errorMessages.push("ログインに失敗しました。");
      return { success: false, messages: errorMessages };
    }
    throw error;
  }
}
