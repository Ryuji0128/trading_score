"use client";

import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useState, ReactNode } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MLBSidebar from "./MLBSidebar";

const DRAWER_WIDTH = 280;

interface MLBLayoutProps {
  children: ReactNode;
  activePath?: string;
}

export default function MLBLayout({ children, activePath }: MLBLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
        {/* モバイルヘッダー */}
        {isMobile && (
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}>
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
