import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ✅ 保存先: public/uploads （public直下）
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        console.log("✅ ファイル保存成功:", filePath);

        // ✅ 返却するURLは「/uploads/...」でOK（public配下なので）
        const imageUrl = `/uploads/${fileName}`;
        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error("❌ アップロードエラー:", error);
        return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
    }
}
