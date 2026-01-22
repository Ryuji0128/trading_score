// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string; // ← ここで role を追加
        } & DefaultSession["user"];
    }

    interface User {
        id?: string;
        role?: string; // ← ここにも追加（PrismaのUserに合わせる）
    }
}