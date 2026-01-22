import { Box } from "@mui/material";
import React from "react";
import LeftSubtitleBox from "./LeftSubtitleBox";

interface ResponsiveAdjustmentContainerProps {
  titlesWidth: { xs: number; sm: number }; // 左側の幅（%）
  contentWidth: { xs: number; sm: number }; // 右側の幅（%）
  titles: string[]; // 2行以上のタイトルを受け取る;
  rightComponent: React.ReactNode; // 右側に表示するコンポーネント
  imageSrc?: string; // 画像のパス
  imageTitle?: string; // 画像のalt
  imageWidth?: string | number;
}

const ResponsiveAdjustmentContainer: React.FC<
  ResponsiveAdjustmentContainerProps
> = ({ titlesWidth, contentWidth, titles, rightComponent, imageSrc, imageTitle, imageWidth = 240, }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // モバイルは縦並び、タブレット以上は横並び
        gap: 4, // 子要素間のスペース
        justifyContent: { xs: "center", sm: "flex-start" }, // モバイル: 中央揃え, タブレット以上: 左揃え
        alignItems: { xs: "center", sm: "flex-start" }, // モバイル: 中央揃え, タブレット以上: 上揃え
        textAlign: "left", // テキストは常に左揃え
        marginBottom: 20, // 下の余白
      }}
    >
      {/* 左側コンポーネント */}
      <Box sx={{ width: { xs: `${titlesWidth.xs}%`, sm: `${titlesWidth.sm}%` } }}>
        <LeftSubtitleBox titles={titles} imageSrc={imageSrc} imageTitle={imageTitle} imageWidth={imageWidth} />{" "}
      </Box>

      {/* 右側コンポーネント */}
      <Box
        sx={{ width: { xs: `${contentWidth.xs}%`, sm: `${contentWidth.sm}%` } }}
      >
        {rightComponent}
      </Box>
    </Box>
  );
};

export default ResponsiveAdjustmentContainer;
