import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
    }

    // ファイルタイプのバリデーション
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "許可されていないファイル形式です（JPEG, PNG, GIF, WebPのみ）" },
        { status: 400 }
      );
    }

    // ファイルサイズのバリデーション
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます（最大5MB）" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // ファイル名をサニタイズ（英数字、ハイフン、アンダースコア、ドットのみ許可）
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: imageUrl });
  } catch {
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
