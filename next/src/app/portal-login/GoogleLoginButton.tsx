"use client";

// import { googleAuthenticate } from "@/actions/google-login"; // 認証機能は後から実装
// import { useActionState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import { Alert, Box, Button } from "@mui/material";

const GoogleLogin = () => {
  // 認証機能は後から実装予定
  const handleGoogleLogin = () => {
    alert("Google認証機能は現在準備中です");
  };

  return (
    <Box
      maxWidth={400}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 2,
      }}
    >
      <Button
        onClick={handleGoogleLogin}
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        sx={{
          height: 50,
          fontSize: "1rem",
          fontWeight: 500,
          color: "#444",
          borderColor: "#ddd",
          borderRadius: 2,
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            borderColor: "#ccc",
          },
        }}
      >
        Googleでログイン（準備中）
      </Button>

      <Alert severity="info" sx={{ width: "100%" }}>
        Google認証機能は現在実装中です
      </Alert>
    </Box>
  );
};

export default GoogleLogin;