import Link from "next/link";
import { Box, Typography, Button, Container } from "@mui/material";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight="80vh"
        textAlign="center"
      >
        <Typography
          variant="h1"
          sx={{ fontSize: "6rem", fontWeight: "bold", color: "#1a472a", mb: 2 }}
        >
          404
        </Typography>
        <Typography variant="h5" sx={{ color: "gray", mb: 4 }}>
          ページが見つかりません
        </Typography>
        <Link href="/" passHref>
          <Button
            variant="outlined"
            sx={{
              color: "#1a472a",
              borderColor: "#1a472a",
              borderWidth: 2,
              padding: "10px 20px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "rgba(26, 71, 42, 0.1)",
                borderColor: "#1a472a",
              },
            }}
          >
            ホームへ戻る
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
