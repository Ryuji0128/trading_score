// // ※必ずサーバーサイドでのみ使用し、フロントサイドでは使用しないこと。

// import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// type SecretValues = Record<string, string>;

// /**
//  * Secret Managerから単一または複数のシークレットを取得するヘルパー関数
//  * または、ローカル環境では process.env から取得
//  * @param secretNames シークレット名の配列
//  * @returns シークレット名とその値のマッピング（オブジェクト形式）
//  */
// async function getSecretValues(secretNames: string[]): Promise<SecretValues> {
//   const client = new SecretManagerServiceClient();
//   const projectId = process.env.GOOGLE_CLOUD_PROJECT;
//   // app.yamlにて設定した環境変数ENVIRONMENTを取得
//   const environment = process.env.ENVIRONMENT?.toUpperCase();
//   // yarn dev環境かどうかの判定
//   const development = (process.env.NODE_ENV as string) === "development";

//   if (!development) {
//     if (!projectId) {
//       throw new Error("GOOGLE_CLOUD_PROJECT環境変数が設定されていません");
//     }

//     if (!environment) {
//       throw new Error("ENVIRONMENT環境変数が設定されていません");
//     }
//   }

//   if (development) {
//     // yarn dev起動時は process.env から取得
//     return secretNames.reduce((acc, secretName) => {
//       const envKey = secretName;
//       const value = process.env[envKey];
//       if (value === undefined) {
//         console.warn(`環境変数 ${envKey} が設定されていません`);
//       }
//       return { ...acc, [envKey]: value || "" };
//     }, {} as SecretValues);
//   }

//   // ローカルにてyarn build && yarn startした場合の環境下では、GCPのSecret Manager経由でSTAGING専用環境変数を取得
//   const prefix = process.env.ENVIRONMENT === "development" ? "STAGING" : environment;

//   // Secret Manager からシークレットを取得
//   const secrets = await Promise.all(
//     secretNames.map(async (secretName) => {
//       const [version] = await client.accessSecretVersion({
//         name: `projects/${projectId}/secrets/${prefix}_${secretName}/versions/latest`,
//       });
//       const secretValue = version.payload?.data?.toString() || "";
//       return { [secretName]: secretValue };
//     })
//   );


//   // 結果を1つのオブジェクトに統合
//   return secrets.reduce((acc, curr) => ({ ...acc, ...curr }), {});
// }

// /**
//  * Secret Managerから複数のシークレットを取得する
//  * または、ローカル環境ではprocess.envから取得する
//  * @param secretNames シークレット名の配列
//  * @returns シークレット名の値をマッピングしたオブジェクト
//  */
// export async function fetchSecrets(secretNames: string[]): Promise<SecretValues> {
//   return getSecretValues(secretNames);
// }

// /**
//  * Secret Managerから単一のシークレットを取得する
//  * または、ローカル環境ではprocess.envから取得する
//  * @param secretName シークレット名
//  * @returns シークレットの値
//  */
// export async function fetchSecret(secretName: string): Promise<string> {
//   const secrets = await getSecretValues([secretName]);
//   const secretValue = secrets[secretName];
//   return secretValue || "";
// }

// import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

type SecretValues = Record<string, string>;

/**
 * Google Secret Manager 未使用環境のダミー関数
 * 本番で使用する場合は GCP 認証を再度有効化してください。
 */
async function getSecretValues(secretNames: string[]): Promise<SecretValues> {
  console.warn("[fetchSecrets] Google Secret Manager は現在無効化されています。");
  // process.env から値を取得して返す（ローカル想定）
  return secretNames.reduce((acc, secretName) => {
    const value = process.env[secretName];
    return { ...acc, [secretName]: value || "" };
  }, {} as SecretValues);
}

export async function fetchSecrets(secretNames: string[]): Promise<SecretValues> {
  return getSecretValues(secretNames);
}

export async function fetchSecret(secretName: string): Promise<string> {
  const secrets = await getSecretValues([secretName]);
  return secrets[secretName] || "";
}
