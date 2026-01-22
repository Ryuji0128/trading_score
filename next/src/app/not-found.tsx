"use client";

import React, { useState, useEffect } from "react";
import { Button, Typography, Box, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";
import { useSimpleBar } from "@/components/SimpleBarWrapper";

// ランダムな値を生成する関数
const getRandomValue = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

// 三角形データ生成関数
const generateTriangles = (count: number) => {
  return Array.from({ length: count }, () => ({
    size: getRandomValue(100, 300), // サイズ
    opacity: getRandomValue(0.7, 1.0), // 透明度
    bottom: `${getRandomValue(0, 80)}%`, // 下方向のランダムな位置
    right: `${getRandomValue(0, 80)}%`, // 右方向のランダムな位置
    rotation: getRandomValue(-30, 30), // 回転角度
  }));
};

export default function NotFound() {
  const theme = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const { scrollContainerRef } = useSimpleBar();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const appBarHeight = isMobile
    ? theme.custom.header.height.mobile
    : theme.custom.header.height.desktop; // モバイル: 56px, デスクトップ: 64px

  const [triangles, setTriangles] = useState<
    {
      size: number;
      opacity: number;
      bottom: string;
      right: string;
      rotation: number;
    }[]
  >([]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) return;

    setTriangles(generateTriangles(7)); // 7つの三角形を生成

    // スクロールイベントのリスナー
    const handleScroll = () => {
      setScrollY(scrollContainer.scrollTop);
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  // 線形補間（Lerp）関数
  const lerp = (start: number, end: number, t: number): number =>
    start + t * (end - start);

  // HexカラーをRGBに変換する関数
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // スクロール位置に基づいて色の透明度を計算
  const calculateColor = (scrollY: number) => {
    const startColor = hexToRgb(theme.palette.primary.light); 
    const targetColor = hexToRgb(theme.palette.primary.main); 
  
    const t = Math.min(scrollY / 500, 1); // 進行度: 0（初期）〜 1（最大）
    const r = Math.round(lerp(startColor.r, targetColor.r, t));
    const g = Math.round(lerp(startColor.g, targetColor.g, t));
    const b = Math.round(lerp(startColor.b, targetColor.b, t));
    const opacity = Math.min(0.3 + scrollY / 1000, 1); // 透明度制御

    return `rgba(${r}, ${g}, ${b}, ${opacity})`; // 補間された色
  };

  const fontSize = isMobile ? "3rem" : "6rem";

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      height={`calc(100vh - ${appBarHeight}px)`} // 100vhからAppBarの高さを引く
      bgcolor="#f5f5f5"
      position="relative"
      overflow="hidden"
    >
      {/* 影付きテキスト */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
        style={{
          position: "absolute",
          color: "rgba(0, 0, 0, 0.1)",
          zIndex: 0,
          transform: "translateY(30px) scale(1.1)",
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: fontSize, fontWeight: "bold", textAlign: "center" }}
        >
          404
        </Typography>
      </motion.div>

      {/* メインテキスト */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        style={{ zIndex: 1, textAlign: "center" }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: fontSize,
            fontWeight: "bold",
            color: "black",
            textShadow: "4px 4px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "gray",
            mt: 2,
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          ページが見つかりません
        </Typography>
      </motion.div>

      {/* 戻るボタン */}
      <Box sx={{ mt: 4, zIndex: 1 }}>
        <Link href="/" passHref>
          <Button
            variant="outlined"
            sx={{
              color: "black", // テキスト色
              borderColor: "black", // 外枠の色
              borderWidth: 2, // 外枠を太く
              padding: "10px 20px",
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)", // ホバー時の背景色
                borderColor: "black",
              },
            }}
          >
            ホームへ戻る
          </Button>
        </Link>
      </Box>

      {/* 三角形の装飾 */}
      {triangles.map((triangle, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            bottom: triangle.bottom,
            right: triangle.right,
            width: `${triangle.size}px`,
            height: `${triangle.size}px`,
            backgroundColor: calculateColor(scrollY), // スクロールに応じた色
            clipPath: "polygon(0 0, 100% 50%, 0 100%)", // 正三角形
            transform: `rotate(${triangle.rotation}deg)`,
            opacity: triangle.opacity,
          }}
        />
      ))}
    </Box>
  );
}
