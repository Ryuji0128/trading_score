"use client";

import { Box, Container, Paper, Typography, Chip, Table, TableBody, TableRow, TableCell } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Link from "next/link";

const adminInfo = [
  { label: "サイト名", value: "MLB Note" },
  { label: "サイトURL", value: "https://baseball-now.com" },
  { label: "運営者", value: "MLB Note 運営者" },
  { label: "連絡先", value: "お問い合わせページよりご連絡ください" },
  { label: "サイト開設", value: "2025年" },
  { label: "サイト内容", value: "MLBに関するデータ（Topps NOWカード、WBC情報等）の収集・公開" },
];

export default function AdminInfoContent() {
  return (
    <MLBLayout activePath="/admin-info">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background:
              "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M50 0 L60 40 L100 40 L68 62 L80 100 L50 76 L20 100 L32 62 L0 40 L40 40 Z\" fill=\"%23ffffff\" fill-opacity=\"0.03\"/%3E%3C/svg%3E')",
            backgroundSize: "80px 80px",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<AdminPanelSettingsIcon sx={{ color: "white !important" }} />}
            label="Admin Info"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            サイト管理者情報
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            当サイトの運営に関する情報です。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e8f5e9",
            background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a472a", mb: 3 }}>
            運営者情報
          </Typography>

          <Table>
            <TableBody>
              {adminInfo.map((item) => (
                <TableRow key={item.label} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a472a",
                      width: { xs: "120px", md: "180px" },
                      verticalAlign: "top",
                      py: 2,
                    }}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", py: 2 }}>
                    {item.label === "連絡先" ? (
                      <Link href="/contact" style={{ color: "#2e7d32", textDecoration: "underline" }}>
                        {item.value}
                      </Link>
                    ) : item.label === "サイトURL" ? (
                      <a href={item.value} style={{ color: "#2e7d32", textDecoration: "underline" }}>
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </MLBLayout>
  );
}
