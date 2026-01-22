import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import BaseContainer from "@/components/BaseContainer";
import GoogleLoginButton from "./GoogleLoginButton";
import CredentialsLoginForm from "./CredentialsLoginForm";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function LoginContents() {
  return (
    <BaseContainer>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "60vh",
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 450,
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          {/* ロゴアイコン */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlinedIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
          </Box>

          {/* タイトル */}
          <Typography
            variant="h5"
            component="h1"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              mb: 1,
            }}
          >
            ログイン
          </Typography>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 4,
            }}
          >
            アカウント情報を入力してください
          </Typography>

          {/* Credentials ログイン */}
          <CredentialsLoginForm />

          {/* Google ログイン */}
          <GoogleLoginButton />
        </Paper>
      </Box>
    </BaseContainer>
  );
}
