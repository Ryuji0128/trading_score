import * as z from "zod";

// Todo: 今後、バリデーション関数ではなく、zodバリデーションスキーマの仕様に統一することも検討する
export interface ValidationError {
  [key: string]: string; // 各フィールドに対するエラーメッセージ
}

// 共通バリデーションロジック
const validateName = (name: string): string | null => {
  if (!name) {
    return "氏名を入力してください。";
  } else if (name.length > 50) {
    return "氏名は50文字以内で入力してください。";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  const emailPattern =
    /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
  if (!email) {
    return "メールアドレスを入力してください。";
  } else if (!emailPattern.test(email)) {
    return "有効なメールアドレスを入力してください。";
  }
  return null;
};

// 問い合わせフォームバリデーション

export interface InquiryData {
  name: string;
  company?: string; // 任意フィールド
  email: string;
  phone?: string; // 任意フィールド
  inquiry: string;
}

export const validateInquiry = (data: InquiryData): ValidationError => {
  const errors: ValidationError = {};

  // 氏名: 必須, 最大50文字
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  // メールアドレス: 必須, 正しい形式
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  // 電話番号: 任意, 日本の電話番号形式
  const phonePattern = /^(\d{2,4}-?\d{2,4}-?\d{4})?$/;
  if (data.phone && !phonePattern.test(data.phone)) {
    errors.phone = "有効な電話番号を入力してください。";
  }

  // お問い合わせ内容: 必須, 最大500文字
  if (!data.inquiry) {
    errors.inquiry = "お問い合わせ内容を入力してください。";
  } else if (data.inquiry.length > 500) {
    errors.inquiry = "お問い合わせ内容は500文字以内で入力してください。";
  }

  return errors;
};

// ユーザー登録フォームのバリデーションスキーマ
export const RegistrationSchema = z.object({
  name: z
    .string()
    .min(1, { message: "氏名を入力してください。" })
    .max(50, { message: "氏名は50文字以内で入力してください。" }),
  email: z
    .string()
    .min(1, { message: "メールアドレスを入力してください。" })
    .email({ message: "有効なメールアドレスを入力してください。" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください。" })
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "パスワードは大文字・小文字・数字をそれぞれ含める必要があります。",
    }),
});

// ログインフォームのバリデーションスキーマ
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスを入力してください。" })
    .email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
})

export type RegistrationData = z.infer<typeof RegistrationSchema>;