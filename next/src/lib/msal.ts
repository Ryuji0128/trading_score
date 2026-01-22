// GraphAPIを用いたOutlookメールサービスへのアクセスに必要なアクセストークンを取得するための関数を定義

import { ConfidentialClientApplication } from "@azure/msal-node";
import { fetchSecrets } from "./fetchSecrets";

const secretNames = ["AZURE_CLIENT_ID", "AZURE_TENANT_ID", "AZURE_CLIENT_SECRET"];

// Microsoft Authentication Library (MSAL) の構成情報を取得
async function getMsalConfig() {
  const secrets = await fetchSecrets(secretNames);

  return {
    auth: {
      clientId: secrets.AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${secrets.AZURE_TENANT_ID}`,
      clientSecret: secrets.AZURE_CLIENT_SECRET,
    },
  };
}

let cca: ConfidentialClientApplication | null = null;

// アクセストークンを取得
export async function getMsalAccessToken() {
  if (!cca) {
    const msalConfig = await getMsalConfig();
    cca = new ConfidentialClientApplication(msalConfig);
  }

  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  if (!result) {
    throw new Error("Failed to acquire token");
  }

  return result.accessToken;
}