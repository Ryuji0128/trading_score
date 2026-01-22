import { NextResponse, NextRequest } from "next/server";
import { fetchSecret } from "@/lib/fetchSecrets";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ success: false, message: 'No token provided' }, { status: 400 });
  }

  const secretName = "RECAPTCHA_SECRET_KEY";
  const recaptchaKey = await fetchSecret(secretName);

  try {
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await axios.post(verificationUrl, null, {
      params: {
        secret: recaptchaKey,
        response: token,
      },
    });

    const { success, score } = response.data;

    if (!success) {
      // トークンが無効な場合
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 400 }
      );
    }
    
    if (score < 0.5) {
      // トークンは有効だがスコアが低い場合
      return NextResponse.json(
        { success: false, message: 'Low score, verification failed' },
        { status: 403 }
      );
    }
    
    // トークンが有効でスコアが閾値以上の場合
    return NextResponse.json(
      { success: true, message: 'Verification successful' },
      { status: 200 }
    );  } catch (error) {
    console.error("reCAPTCHA 検証エラー:", error);
    return NextResponse.json({ success: false, error: "reCAPTCHA 検証に失敗しました。" }, { status: 500 });
  }
}