"use client";

import { Box, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import StyleIcon from "@mui/icons-material/Style";

const menuItems = [
  { text: "ホーム", icon: <HomeIcon />, path: "/" },
  { text: "MLBブログ", icon: <SportsBaseballIcon />, path: "/discription" },
  { text: "Topps Now", icon: <StyleIcon />, path: "/topps-now" },
  { text: "試合レビュー", icon: <ArticleIcon />, path: "/reviews" },
  { text: "選手分析", icon: <StarIcon />, path: "/players" },
  { text: "統計データ", icon: <TrendingUpIcon />, path: "/stats" },
  { text: "会社概要", icon: <InfoIcon />, path: "/about" },
  { text: "お問い合わせ", icon: <ContactMailIcon />, path: "/contact" },
];

const favoriteTeams = [
  { name: "ロサンゼルス・ドジャース", wins: 100, losses: 62, color: "#005A9C" },
  { name: "ニューヨーク・ヤンキース", wins: 98, losses: 64, color: "#003087" },
  { name: "ロサンゼルス・エンゼルス", wins: 73, losses: 89, color: "#BA0021" },
];

interface MLBSidebarProps {
  activePath?: string;
}

export default function MLBSidebar({ activePath = "/" }: MLBSidebarProps) {
  return (
    <Box sx={{ height: "100%", background: "linear-gradient(180deg, #1a472a 0%, #0d2818 100%)" }}>
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
          MLB Fanatic
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
          メジャーリーグを語る
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

      <Box sx={{ px: 3, pt: 4 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          お気に入りチーム
        </Typography>
        <Box sx={{ mt: 2 }}>
          {favoriteTeams.map((team, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                background: "rgba(255,255,255,0.05)",
                borderLeft: `4px solid ${team.color}`,
              }}
            >
              <Typography variant="caption" sx={{ color: "white", fontWeight: 600, fontSize: "0.75rem" }}>
                {team.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", display: "block", fontSize: "0.7rem" }}>
                {team.wins}勝 {team.losses}敗
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", textAlign: "center" }}>
          © 2024 MLB Blog
        </Typography>
      </Box>
    </Box>
  );
}
