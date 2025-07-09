import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { ENV } from "~/.server/ENV";

export const secretsMgrClient = new SecretsManagerClient({
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
  region: ENV.AWS_REGION,
});
