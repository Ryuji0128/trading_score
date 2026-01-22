"use client";

import { Box, Chip, Container, Typography } from "@mui/material";

const techStack = {
  "Software": ["React", "Next.js", "TypeScript", "Python", "Node.js", "Flutter"],
  "Hardware": ["Arduino", "Raspberry Pi", "ESP32", "STM32", "FPGA"],
  "Fabrication": ["3Dプリンタ", "レーザー加工機", "CNC", "基板設計", "はんだ付け"],
  "Infrastructure": ["AWS", "GCP", "Docker", "Linux", "Git"],
};

const TechStackSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.5rem" },
              mb: 2,
            }}
          >
            Skills & Tools
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 400 }}
          >
            ソフトもハードも、幅広い技術でものづくりを支えます
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(techStack).map(([category, techs]) => (
            <Box key={category}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "primary.main",
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {techs.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    sx={{
                      px: 2,
                      py: 2.5,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      bgcolor: "primary.pale",
                      color: "primary.dark",
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "white",
                      },
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default TechStackSection;
