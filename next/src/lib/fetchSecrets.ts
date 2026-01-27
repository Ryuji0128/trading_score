type SecretValues = Record<string, string>;

/**
 * 環境変数からシークレット値を取得する
 * 本番環境でGCP Secret Managerを使用する場合は、このファイルを拡張してください
 */
async function getSecretValues(secretNames: string[]): Promise<SecretValues> {
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
