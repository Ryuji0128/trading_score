"use client";

import { Box, Container, Grid, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const features = [
  "ソフトウェア × ハードウェアの融合",
  "アイデアから製品化までワンストップ",
  "小回りの利くスピード感",
  "「面白そう」から始まるものづくり",
];

const AboutSection = () => {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: "primary.main",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 3,
              }}
            >
              About Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 2,
                mb: 4,
                opacity: 0.9,
              }}
            >
              瀬田製作所は「やりたいことをやる」をモットーに、
              ソフトウェアとハードウェアの垣根を越えたものづくりを行っています。
              <br /><br />
              Webアプリから電子工作、3Dプリントまで。
              「こんなの作れる？」という相談から、一緒にカタチにしていきます。
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircleIcon sx={{ color: "secondary.light" }} />
                  <Typography variant="body1">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                p: 4,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  textAlign: "center",
                  color: "secondary.light",
                }}
              >
                できること
              </Typography>
              <Grid container spacing={2}>
                {[
                  "Webアプリ開発",
                  "モバイルアプリ",
                  "組み込みシステム",
                  "IoTデバイス",
                  "電子回路設計",
                  "3Dプリント",
                  "レーザー加工",
                  "試作・プロトタイプ",
                ].map((skill, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      sx={{
                        bgcolor: "rgba(255,255,255,0.15)",
                        borderRadius: 2,
                        p: 1.5,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="body2">{skill}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutSection;
