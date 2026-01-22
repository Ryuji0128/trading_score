import { Box, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

interface titleProps {
  titles: string[];
  imageSrc?: string;
  imageTitle?: string;
  imageWidth?: string | number;
}

const LeftSubtitleBox: React.FC<titleProps> = ({
  titles,
  imageSrc,
  imageTitle,
  imageWidth = 240,

}) => {
  const accentLineHeight = 8;

  return (
    <Box
      sx={{
        width: imageWidth,
        maxWidth: { md: "400px" },
        display: "flex",
        flexDirection: { xs: "column-reverse", sm: "column" },
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "1px",
            backgroundColor: "info.light",
            marginBottom: `${-accentLineHeight / 2}px`,
          }}
        />
        <Box
          sx={{
            width: { xs: "4rem", sm: "5rem", md: "6rem" },
            height: `${accentLineHeight}px`,
            backgroundColor: "primary.main",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          flexWrap: "wrap",
          width: "100%",
          paddingTop: 2,
          paddingBottom: { xs: 4 },
          justifyContent: "center",
        }}
      >
        {titles.map((title, index) => (
          <Typography
            key={index}
            variant="h3"
            sx={{
              lineHeight: 1.2,
              fontSize: { xs: "1.5rem", sm: "1.5rem", md: "1.7rem" },
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        ))}
      </Box>
      {imageSrc && (
        <Box
          sx={{
            width: "100%",
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            paddingTop: 2,
          }}
        >
          <Image
            src={imageSrc}
            alt={imageTitle ?? ""}
            width={100}
            height={100}
            style={{ width: "100%", height: "auto" }}
            sizes="100vw"
          />
        </Box>
      )}
    </Box>
  );
};

export default LeftSubtitleBox;
