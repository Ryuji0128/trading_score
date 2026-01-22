"use client";

import { Box, Card, CardContent, Container, Grid, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import MemoryIcon from "@mui/icons-material/Memory";
import BuildIcon from "@mui/icons-material/Build";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const services = [
  {
    icon: <CodeIcon sx={{ fontSize: 48 }} />,
    title: "ソフトウェア開発",
    description: "Webアプリ、モバイルアプリ、業務システムなど、あらゆるソフトウェアを開発します。",
  },
  {
    icon: <MemoryIcon sx={{ fontSize: 48 }} />,
    title: "ハードウェア開発",
    description: "組み込みシステム、IoTデバイス、電子回路設計など、ハードウェアの開発も手がけます。",
  },
  {
    icon: <BuildIcon sx={{ fontSize: 48 }} />,
    title: "ものづくり・試作",
    description: "3Dプリンタやレーザー加工機を活用し、アイデアを素早くカタチにします。",
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 48 }} />,
    title: "新規事業・R&D",
    description: "やりたいことを一緒に実現。新しい挑戦を技術でサポートします。",
  },
];

const ServicesSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: "background.default" }}>
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
            What We Do
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 400 }}
          >
            ソフトとハード、両方できるからこそ生まれる価値があります
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  },
                }}
                elevation={2}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: "primary.main", mb: 2 }}>
                    {service.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServicesSection;
