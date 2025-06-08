import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "../ENV";
import { s3Client } from "./s3Client";

export const SIGNED_URL_DFLT_EXPIRATION = 60; // 1m

export const createPresignedUrl = ({
  expiresSeconds,
  key,
}: {
  expiresSeconds?: number;
  key: string;
}) => {
  const command = new PutObjectCommand({
    Bucket: ENV.AWS_DATA_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, {
    expiresIn: expiresSeconds ?? SIGNED_URL_DFLT_EXPIRATION,
  });
};
