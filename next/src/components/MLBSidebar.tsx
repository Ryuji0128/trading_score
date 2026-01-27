"use client";

import { Box, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StyleIcon from "@mui/icons-material/Style";
import LoginIcon from "@mui/icons-material/Login";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsIcon from "@mui/icons-material/Sports";
import PublicIcon from "@mui/icons-material/Public";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const menuItems = [
  { text: "ホーム", icon: <HomeIcon />, path: "/" },
  { text: "ブログ", icon: <ArticleIcon />, path: "/blog" },
  { text: "Topps Now", icon: <StyleIcon />, path: "/topps-now" },
  { text: "MLB順位表", icon: <TrendingUpIcon />, path: "/stats" },
  { text: "最近の試合結果", icon: <SportsIcon />, path: "/games" },
  { text: "WBC情報", icon: <PublicIcon />, path: "/wbc" },
  { text: "チーム一覧", icon: <EmojiEventsIcon />, path: "/teams" },
  { text: "管理者情報", icon: <AdminPanelSettingsIcon />, path: "/admin-info" },
];

interface MLBSidebarProps {
  activePath?: string;
}

export default function MLBSidebar({ activePath = "/" }: MLBSidebarProps) {
  return (
    <Box sx={{
      height: "100%",
      background: `
        linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
        linear-gradient(180deg, #1a472a 0%, #0d2818 100%)
      `,
      backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px, 100% 100%",
      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0, 0 0",
    }}>
      <Box sx={{ p: 3, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
            fontSize: 32,
          }}
        >
          <SportsBaseballIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
          MLB Note
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
          個人的MLBデータまとめ
        </Typography>
      </Box>

      <List sx={{ px: 2, pt: 3 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              href={item.path}
              sx={{
                borderRadius: 2,
                color: item.path === activePath ? "#fff" : "rgba(255,255,255,0.7)",
                background: item.path === activePath ? "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)" : "transparent",
                "&:hover": {
                  background: item.path === activePath ? "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)" : "rgba(255,255,255,0.05)",
                },
                transition: "all 0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.path === activePath ? 600 : 400,
                  fontSize: "0.95rem"
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <ListItemButton
          href="/login"
          sx={{
            borderRadius: 1,
            color: "rgba(255,255,255,0.4)",
            py: 0.5,
            "&:hover": {
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.05)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
            <LoginIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary="管理者"
            primaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </ListItemButton>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", textAlign: "center", mt: 1 }}>
          © 2025 MLB Note
        </Typography>
      </Box>
    </Box>
  );
}
