import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "../ENV";
import { s3Client } from "./s3Client";

const SIGNED_URL_DFLT_EXPIRATION = 60; // 1m

export const createPresignedUrl = ({
  key,
  expiresSeconds,
}: {
  key: string;
  expiresSeconds?: number;
}) => {
  const command = new PutObjectCommand({
    Bucket: ENV.AWS_DATA_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, {
    expiresIn: expiresSeconds ?? SIGNED_URL_DFLT_EXPIRATION,
  });
};
