import { getPrismaClient } from "@/lib/db";
import { validateInquiry } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import xss from "xss";

const prisma = getPrismaClient();

/**
 * ✅ 問い合わせ登録（メール送信 + DB保存）
 */
export async function POST(req: NextRequest) {
  try {
    const inquiryData = await req.json();

    // 🔹 XSS対策
    const sanitizedData = {
      name: xss(inquiryData.name || ""),
      email: xss(inquiryData.email || ""),
      phone: xss(inquiryData.phone || ""),
      inquiry: xss(inquiryData.inquiry || ""),
    };

    // 🔹 バリデーション
    const validateResult = validateInquiry(sanitizedData);
    if (Object.keys(validateResult).length > 0) {
      return NextResponse.json({ errors: validateResult }, { status: 400 });
    }

    // 🔹 DB登録
    const inquiryRecord = await prisma.inquiry.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        inquiry: sanitizedData.inquiry,
      },
    });

    // 🔹 nodemailer設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

    // 🔸 管理者宛メール
    await transporter.sendMail({
      from: `"瀬田製作所Webフォーム" <${process.env.SMTP_USER}>`,
      to: adminAddress,
      subject: `【お問い合わせ】${sanitizedData.name} 様より`,
      html: `
        <h3>新しいお問い合わせがありました。</h3>
        <p><strong>お名前:</strong> ${sanitizedData.name}</p>
        <p><strong>メール:</strong> ${sanitizedData.email}</p>
        <p><strong>電話番号:</strong> ${sanitizedData.phone}</p>
        <p><strong>お問い合わせ内容:</strong><br>${sanitizedData.inquiry}</p>
        <hr />
        <p><small>ID: ${inquiryRecord.id} / ${inquiryRecord.createdAt}</small></p>
      `,
    });

    // 🔸 自動返信メール
    await transporter.sendMail({
      from: `"瀬田製作所" <${process.env.SMTP_USER}>`,
      to: sanitizedData.email,
      subject: "【自動返信】お問い合わせありがとうございます",
      html: `
        <p>${sanitizedData.name} 様</p>
        <p>このたびはお問い合わせありがとうございます。</p>
        <p>以下の内容で受け付けました。</p>
        <hr />
        <p>${sanitizedData.inquiry}</p>
        <hr />
        <p>２営業日以内に、担当者よりご連絡いたします。</p>
        <p>瀬田製作所<br>
        〒<br>
        Email: info@setaseisakusyo.com<br>
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "問い合わせを登録し、メールを送信しました。",
    });
  } catch (error) {
    console.error("問い合わせ処理エラー:", error);
    return NextResponse.json(
      { success: false, error: "送信・登録処理に失敗しました。" },
      { status: 500 }
    );
  }
}

/**
 * ✅ 問い合わせ一覧取得
 */
export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("問い合わせ取得エラー:", error);
    return NextResponse.json(
      { error: "問い合わせ一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * ✅ 問い合わせ削除
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "IDが指定されていません" },
        { status: 400 }
      );
    }

    await prisma.inquiry.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("問い合わせ削除エラー:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
