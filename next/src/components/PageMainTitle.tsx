import { Box, Typography } from "@mui/material";
import React from "react";

interface titleProps {
  japanseTitle: string;
  englishTitle: string;
  customPadding?: string;
}

const PageMainTitle: React.FC<titleProps> = ({ japanseTitle, englishTitle, customPadding }) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        padding: customPadding ? customPadding : "7rem 0",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: "bold",
          mb: 1,
        }}
      >
        {japanseTitle}
      </Typography>
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{
          color: "#555",
          fontStyle: "italic",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        }}
      >
        {englishTitle}
      </Typography>
    </Box>
  );
};

export default PageMainTitle;
