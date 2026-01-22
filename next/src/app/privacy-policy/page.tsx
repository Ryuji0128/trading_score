import React from "react";
import PrivacyPolicyMainTitle from "./PrivacyPolicyMainTitle";
import PrivacyPolicyDetails from "./PrivacyPolicyDetails";
import { Box } from "@mui/material";

export default function PrivacyPolicy() {
  return (
    <>
      <PrivacyPolicyMainTitle />
      <PrivacyPolicyDetails />
      <Box mb={10}></Box>
    </>
  );
}
