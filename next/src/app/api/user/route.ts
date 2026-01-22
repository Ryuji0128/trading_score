import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { UserRole } from "@prisma/client"; // PrismaのEnumをインポート

const RegistrationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  provider: z.string().nullable().optional(),
  role: z.string(),
});

export async function GET(req: Request) {
  try {
    const prisma = await getPrismaClient();
    
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    let users;

    if (email) {
      // メールが指定されている場合は、特定のユーザーのみ取得
      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: { select: { provider: true } } },
      });

      if (!user) {
        return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
      }

      users = [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          provider: user.accounts.length > 0 ? user.accounts[0].provider : null,
        },
      ];
    } else {
      // メールが指定されていない場合は、全ユーザー取得
      const allUsers = await prisma.user.findMany({
        include: { accounts: { select: { provider: true } } },
      });

      users = allUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        provider: user.accounts.length > 0 ? user.accounts[0].provider : null,
      }));
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("データベース接続エラー:", error);
    return NextResponse.json({ error: "ユーザーの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const body = await req.json();

    // バリデーションチェック
    const validationResult = RegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = validationResult.data;
    const role = body.role ?? "VIEWER"; // デフォルト値を設定

    // `email` が既に登録されているかチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // ソルトを生成
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // `User` を作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "ユーザーが正常に追加されました (Credentials)",
      user,
    });
  } catch (error) {
    console.error("データベース接続エラー:", error);
    return NextResponse.json({ error: "ユーザーの追加に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "無効な入力: メールアドレスが必要です" }, { status: 400 });
    }

    // 先に `Account` を削除しないとエラーが発生する可能性がある
    await prisma.account.deleteMany({
      where: { user: { email } },
    });

    await prisma.user.delete({
      where: { email },
    });

    return NextResponse.json({ message: "ユーザーが正常に削除されました" });
  } catch (error) {
    console.error("データベース接続エラー:", error);
    return NextResponse.json({ error: "ユーザーの削除に失敗しました" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const body = await req.json();
    // バリデーションチェック
    const validationResult = RegistrationSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.flatten() }, { status: 400 });
    }

    const { name, email, password, role, provider } = validationResult.data;
    const updatedData: { name?: string; email?: string; password?: string; role?: UserRole } = {};

    // `email` でユーザーを検索
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスのユーザーは存在しません" },
        { status: 404 }
      );
    }

    // もし `Account` を持っていたら（＝Google 認証されていたら）、名前とメールを削除
    if (provider && existingUser.accounts.length > 0) {
      delete updatedData.name;
      delete updatedData.email;
    } else {
      updatedData.name = name;
      updatedData.email = email;
    }
    updatedData.role = role as UserRole;

    if (password) {
      // ソルトを生成
      const salt = await bcryptjs.genSalt(10);
      updatedData.password = await bcryptjs.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updatedData,
    });
  
    return NextResponse.json({
      message: "ユーザー情報が正常に更新されました (Credentials)",
      updatedUser,
    });
  } catch (error) {
    console.error("データベース接続エラー:", error);
    return NextResponse.json({ error: "ユーザー情報の更新に失敗しました" }, { status: 500 });
  }
}