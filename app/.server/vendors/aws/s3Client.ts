import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "~/.server/ENV";

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: ENV.AWS_S3_ACCESS_KEY,
    secretAccessKey: ENV.AWS_S3_SECRET,
  },
  region: ENV.AWS_REGION,
});
