import React from "react";
import { Box, Container } from "@mui/material";
import { themeConstants } from "@/theme/themeConstants";

interface BaseContainerProps {
  children: React.ReactNode;
  backgroundImageSrc?: string;
  backgroundColor?: string;
  marginBottom?: number;
}

const BaseContainer: React.FC<BaseContainerProps> = ({
  children,
  backgroundImageSrc,
  backgroundColor,
  marginBottom
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: backgroundColor ?? "transparent",
        backgroundImage: backgroundImageSrc ? `url(${backgroundImageSrc})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        marginBottom: marginBottom ?? 0,
      }}
    >
      <Container
        sx={{
          width: "100%",
          margin: "0 auto",
          padding: 2,
          [`@media (min-width:${themeConstants.breakpoints.values.sm}px)`]: {
            padding: 3,
          },
          [`@media (min-width:${themeConstants.breakpoints.values.md}px)`]: {
            padding: 4,
          },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default BaseContainer;