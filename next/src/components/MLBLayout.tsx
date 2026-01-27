"use client";

import { Box, Drawer, IconButton, useMediaQuery, useTheme, Button } from "@mui/material";
import { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import MLBSidebar from "./MLBSidebar";

const DRAWER_WIDTH = 280;

interface MLBLayoutProps {
  children: ReactNode;
  activePath?: string;
}

export default function MLBLayout({ children, activePath }: MLBLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7f6" }}>
      {/* サイドバー */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
            }}
          >
            <MLBSidebar activePath={activePath} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                borderRight: "none",
              },
            }}
            open
          >
            <MLBSidebar activePath={activePath} />
          </Drawer>
        )}
      </Box>

      {/* メインコンテンツ */}
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* ヘッダー: モバイル時またはログイン時のみ表示 */}
        {(isMobile || (mounted && isLoggedIn)) && (
          <Box sx={{
            p: 1.5,
            borderBottom: "1px solid rgba(13,40,24,0.15)",
            background: `
              linear-gradient(45deg, rgba(26,71,42,0.04) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(26,71,42,0.04) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(26,71,42,0.04) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(26,71,42,0.04) 75%),
              white
            `,
            backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px, 100% 100%",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0, 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {isMobile ? (
              <IconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            ) : <Box />}

            {mounted && isLoggedIn && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
              >
                ログアウト
              </Button>
            )}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
