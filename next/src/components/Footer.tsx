"use client";

import { Box, Link, Toolbar, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

export default function Footer() {

  //　現在のURLを取得し、管理者ページでFooterを非表示にする
  const params = usePathname();
  const isFooterDisabled = params.includes("portal-")
  if (isFooterDisabled) {
    return null;
  }
  
  return (
    <Box
      component="footer"
      sx={{
        position: "static",
        bottom: 0,
        background: `
          linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
          linear-gradient(180deg, #1a472a 0%, #0d2818 100%)
        `,
        backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px, 100% 100%",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0, 0 0",
        color: "#fff",
        padding: "1rem 0",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Typography variant="body1" color="inherit">
          &copy; {new Date().getFullYear()} MLB Note
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <Link
            href="/terms"
            color="inherit"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            利用規約
          </Link>
          <Link
            href="/privacy-policy"
            color="inherit"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            プライバシーポリシー
          </Link>
        </Box>
      </Toolbar>
    </Box>
  );
}