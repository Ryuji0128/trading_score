import React from "react";
import LoginContents from "./LoginContents";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return <LoginContents />;
}
