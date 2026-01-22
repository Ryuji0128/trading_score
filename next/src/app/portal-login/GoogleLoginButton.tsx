"use client";

import { googleAuthenticate } from "@/actions/google-login";
import { useActionState } from "react";
import { Box, Button, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleLogin = () => {
  const [errorMsgGoogle, dispatchGoogle] = useActionState(googleAuthenticate, undefined);

  return (
    <Box
      component="form"
      maxWidth={400}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 2,
      }}
      action={dispatchGoogle}
    >
      <Button
        type="submit"
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        sx={{
          height: 50,
          fontSize: "1rem",
          fontWeight: 500,
          color: "#444",
          borderColor: "#ddd",
          borderRadius: 2,
          backgroundColor: "#fff",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            borderColor: "#ccc",
          },
        }}
      >
        Googleでログイン
      </Button>

      {errorMsgGoogle?.messages && errorMsgGoogle.messages.length > 0 && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsgGoogle.messages.join(", ")}
        </Alert>
      )}
    </Box>
  );
};

export default GoogleLogin;
