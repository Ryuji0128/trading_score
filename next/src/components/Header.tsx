"use client";

import ProfileConsoleModal from "@/components/ProfileConsoleModal";
import { useSimpleBar } from "@/components/SimpleBarWrapper";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { scrollContainerRef } = useSimpleBar();

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => setScrolled(scrollContainer.scrollTop > 200);
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const contentsList = [
    { title: "サービス", href: "/consultation" },
    { title: "会社概要", href: "/discription" },
    { title: "オンライン決済", href: "/payment" },
    { title: "お問い合わせ", href: "/contact" },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled ? "primary.main" : "transparent",
          transition: "background-color 0.5s ease",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: { xs: 56, md: 64 },
            px: { xs: 1, md: 2 },
          }}
        >
          {/* 左側ロゴ */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link
              href="/"
              passHref
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: isTablet ? 36 : 48,
                    height: isTablet ? 36 : 48,
                    bgcolor: "primary.main",
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: isTablet ? 18 : 24,
                  }}
                >
                  S
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    ml: 1.5,
                    fontSize: { xs: "20px", md: "28px" },
                    color: scrolled ? "info.pale" : "info.dark",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  瀬田製作所
                </Typography>
              </Box>
            </Link>
          </Box>

          {/* 右側：PC⇔タブレット/モバイル切り替え */}
          {isTablet ? (
            <>
              {/* ハンバーガーアイコン */}
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
              >
                <MenuIcon sx={{ color: scrolled ? "info.pale" : "info.dark" }} />
              </IconButton>

              {/* プロフィールモーダル */}
              <SessionProvider>
                <ProfileConsoleModal />
              </SessionProvider>

              {/* ドロップダウンメニュー */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                  mt: 1,
                }}
              >
                {contentsList.map((content, index) => (
                  <MenuItem key={index} onClick={handleMenuClose}>
                    <Link
                      href={content.href}
                      passHref
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body1">{content.title}</Typography>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <>
              <Container
                maxWidth="lg"
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {contentsList.map((content, index) => (
                  <Link key={index} href={content.href} passHref>
                    <Button
                      sx={{
                        color: scrolled ? "info.pale" : "info.dark",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                        fontSize: { xs: "13px", md: "15px" },
                        padding: { xs: "0.5rem 0.4rem", md: "0.5rem 0.8rem" },
                      }}
                    >
                      {content.title}
                    </Button>
                  </Link>
                ))}
                <SessionProvider>
                  <ProfileConsoleModal />
                </SessionProvider>
              </Container>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* ヘッダー分の高さを確保 */}
      <Box sx={{ ...theme.mixins.toolbar }} />
    </>
  );
}
