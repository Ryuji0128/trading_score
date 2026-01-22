"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/validation";
import {
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { signIn } from "next-auth/react";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function CredentialsLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const onSubmit = async (data: LoginFormValues) => {
    const { email, password } = data;
    setErrorMessage(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (!result?.error) {
        window.location.href = "/";
      } else {
        setErrorMessage("メールアドレスまたはパスワードが正しくありません。");
      }
    } catch {
      setErrorMessage("ログイン中にエラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <Box
      width="100%"
      maxWidth={400}
      sx={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* エラーメッセージ */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {errorMessage}
        </Alert>
      )}

      {/* メールアドレス */}
      <Controller
        name="email"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="メールアドレス"
            placeholder="example@email.com"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* パスワード */}
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="パスワード"
            placeholder="パスワードを入力"
            type={showPassword ? "text" : "password"}
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="パスワードの表示切替"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* ログインボタン */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          height: 50,
          fontSize: "1rem",
          fontWeight: 600,
          mt: 1,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
          },
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </Button>

      {/* ユーザー登録リンク */}
      <Typography variant="body2" sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}>
        アカウントをお持ちでない方は{" "}
        <Link
          href="/portal-admin/register-user"
          sx={{ textDecoration: "none", fontWeight: "bold", color: "primary.main" }}
        >
          新規登録
        </Link>
      </Typography>

      {/* OR Divider */}
      <Divider sx={{ my: 1 }}>
        <Typography variant="body2" color="text.secondary">
          または
        </Typography>
      </Divider>
    </Box>
  );
}
