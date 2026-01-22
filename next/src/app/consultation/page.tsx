import { Box, Card, CardContent, Container, Grid, Typography } from "@mui/material";
import PageMainTitle from "@/components/PageMainTitle";
import BaseContainer from "@/components/BaseContainer";

const services = [
  {
    title: "ソフトウェア開発",
    description: "Webアプリ、モバイルアプリ、業務システムなど。要件定義から運用まで一貫して対応します。",
    features: ["Webアプリ", "モバイルアプリ", "業務システム", "API開発"],
  },
  {
    title: "ハードウェア開発",
    description: "組み込みシステム、IoTデバイス、電子回路の設計・開発を行います。",
    features: ["組み込みシステム", "IoTデバイス", "電子回路設計", "ファームウェア"],
  },
  {
    title: "ものづくり・試作",
    description: "3Dプリンタ、レーザー加工機などを活用し、アイデアを素早くカタチにします。",
    features: ["3Dプリント", "レーザー加工", "筐体設計", "プロトタイピング"],
  },
  {
    title: "技術コンサルティング",
    description: "技術選定、アーキテクチャ設計、開発プロセス改善などをサポートします。",
    features: ["技術選定", "設計レビュー", "開発支援", "技術研修"],
  },
];

export default function ServicesPage() {
  return (
    <Box>
      <BaseContainer>
        <PageMainTitle japanseTitle="サービス" englishTitle="Services" />
      </BaseContainer>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography variant="body1" sx={{ textAlign: "center", mb: 6, color: "text.secondary", lineHeight: 2 }}>
          ソフトウェアとハードウェア、両方の知見を活かして
          <br />
          お客様の「やりたいこと」を実現します。
        </Typography>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  },
                }}
                elevation={2}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
                  >
                    {service.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: "text.secondary", lineHeight: 1.8 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {service.features.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: "primary.pale",
                          color: "primary.dark",
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.875rem",
                        }}
                      >
                        {feature}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
