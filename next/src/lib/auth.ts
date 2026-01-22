import { getPrismaClient } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "../../auth.config";

const prisma = getPrismaClient();

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 1000, // 1時間
  },
  ...authConfig,
  callbacks: {
    // 必要に応じて有効化
    // async session({ session, token }) {
    //   session.user.id = token.id;
    //   return session;
    // },
    // async jwt({ token, user }) {
    //   if (user) token.id = user.id;
    //   return token;
    // },
  },
});
