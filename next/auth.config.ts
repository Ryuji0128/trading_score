// src/auth.config.ts
import { getPrismaClient } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const prisma = getPrismaClient();

const authConfig = {
  pages: {
    signIn: "/portal-login",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        // ✅ unknown → string に変換
        const email = String(credentials?.email || "");
        const password = String(credentials?.password || "");

        if (!email || !password) {
          throw new Error("メールアドレス若しくはパスワードが入力されていません。");
        }

        // ✅ Prismaのwhere句に安全なstringを渡す
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          },
        });

        if (!user) throw new Error("ユーザーが存在しません。");

        // ✅ パスワード比較時もstring型で確実に渡す
        const passwordMatch = await bcryptjs.compare(password, String(user.password || ""));
        if (!passwordMatch) throw new Error("パスワードが間違っています。");

        // ✅ roleも含めて返す
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // ログイン直後（userが存在する時）
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }

      // 🔥 JWTがすでに存在していて、userが無い（後続リクエスト）ときにも
      // roleが入っていなければ再取得して補完
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        token.role = dbUser?.role || "VIEWER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

} satisfies NextAuthConfig;

export default authConfig;
