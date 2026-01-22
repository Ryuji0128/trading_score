import BaseContainer from "@/components/BaseContainer";
import PageMainTitle from "@/components/PageMainTitle";
import { Box, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";

const companyInfo = [
  { label: "会社名", value: "瀬田製作所" },
  { label: "設立", value: "2024年" },
  { label: "代表者", value: "木村 竜次" },
  { label: "所在地", value: "〒553-0001" },
  { label: "事業内容", value: "ソフトウェア開発、ハードウェア開発、ものづくり・試作、技術コンサルティング" },
  { label: "Email", value: "contact@seta-seisakusho.com" },
];

const values = [
  {
    title: "やりたいことをやる",
    description: "「面白そう」「やってみたい」が原動力。好奇心を大切に、新しいことに挑戦し続けます。",
  },
  {
    title: "垣根を越える",
    description: "ソフトとハードの境界にこだわらず、最適な手段で課題を解決します。",
  },
  {
    title: "一緒につくる",
    description: "お客様と同じ目線で、アイデアを形にしていくパートナーでありたい。",
  },
];

export default function CompanyPage() {
  return (
    <Box>
      <BaseContainer>
        <PageMainTitle japanseTitle="会社概要" englishTitle="About Us" />
      </BaseContainer>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}>
            会社情報
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableBody>
                {companyInfo.map((info, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "primary.pale",
                        width: "30%",
                        borderRight: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      {info.label}
                    </TableCell>
                    <TableCell>{info.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}>
            私たちの想い
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    textAlign: "center",
                    transition: "transform 0.3s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
                  >
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
