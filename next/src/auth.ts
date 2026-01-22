// src/auth.ts
import { getPrismaClient } from "@/lib/db";
import { fetchSecrets } from "@/lib/fetchSecrets";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "../auth.config";

const prisma = getPrismaClient();
const secrets = await fetchSecrets(["AUTH_SECRET"]);

export const {
    handlers: { GET, POST },
    auth,      // ← ✅ これが named export として定義される！
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: secrets.AUTH_SECRET,
    session: { strategy: "jwt" },
    jwt: { maxAge: 60 * 60 },
    ...authConfig,
});
