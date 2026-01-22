"use server";

// useActionState（React19の新機能）により、formアクション（POST）をAPI無しに処理できるため、以下を実装

import { signIn } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";
import * as z from "zod";
import { LoginSchema } from "@/lib/validation";
import { AuthError } from "next-auth";

export const login = async (data: z.infer<typeof LoginSchema>) => {
  const validateData = LoginSchema.safeParse(data);
  const errorMessages: string[] = [];

  // Todo: ログイン時にはバリデーションエラーは必要ないが、念の為実装：不必要なら削除検討
  if (!validateData.success) {
    const errors = validateData.error.flatten();

    // 各フィールドのエラーメッセージを `string[]` に変換
    for (const key in errors.fieldErrors) {
      const fieldError = errors.fieldErrors[key as keyof typeof errors.fieldErrors];
      if (fieldError) {
        errorMessages.push(...fieldError);
      }
    }

    return { success: false, messages: errorMessages };
  }

  const prisma = await getPrismaClient();
  const existUser = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  // ProviderがCredentials以外の場合はパスワードが存在しないため、同じEmailを持つユーザーが存在してもパスワードが存在しなければエラーを返す
  // Todo: 以下のエラーメッセージをそれぞれの状態に分けて返す
  if (!existUser || !existUser.password || !existUser.email) {
    errorMessages.push("ユーザーが存在しません。");
    return { success: false, messages: errorMessages };
  }

  try {
    signIn("credentials", {
      email: existUser.email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    // ログインエラーの場合
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          errorMessages.push("パスワードが間違っています。");
          return { success: false, messages: errorMessages };
        default:
          errorMessages.push("ログインに失敗しました。");
          return { success: false, messages: errorMessages };
      }
    }
    // その他のエラーの場合
    errorMessages.push("サーバーエラーが発生しました、管理者へ問い合わせてください。");
    return { success: false, messages: errorMessages };
  }
  return { success: true };
};
