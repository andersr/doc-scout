import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { ENV } from "~/.server/ENV";

export const secretsMgrClient = new SecretsManagerClient({
  credentials: {
    accessKeyId: ENV.AWS_S3_ACCESS_KEY,
    secretAccessKey: ENV.AWS_S3_SECRET,
  },
  region: ENV.AWS_REGION,
});
