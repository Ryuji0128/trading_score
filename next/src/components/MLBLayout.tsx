"use client";

import { Box, Drawer, IconButton, useMediaQuery, useTheme, Button } from "@mui/material";
import { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
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
        {/* ヘッダー */}
        <Box sx={{
          p: 2,
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
          {!isMobile && <Box />}

          {mounted && (
            <Box>
              {isLoggedIn ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  size="small"
                >
                  ログアウト
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => router.push('/login')}
                  size="small"
                  sx={{
                    bgcolor: "#2e7d32",
                    "&:hover": {
                      bgcolor: "#1a472a",
                    },
                  }}
                >
                  ログイン
                </Button>
              )}
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  );
}
