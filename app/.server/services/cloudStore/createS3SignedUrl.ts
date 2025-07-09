import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SIGNED_URL_DFLT_EXPIRATION } from "~/config/signedUrls";
import { ENV } from "../../ENV";
import { s3Client } from "../../vendors/aws/s3Client";

export const createS3SignedUrl = ({
  expiresSeconds,
  key,
}: {
  expiresSeconds?: number;
  key: string;
}) => {
  const command = new PutObjectCommand({
    Bucket: ENV.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, {
    expiresIn: expiresSeconds ?? SIGNED_URL_DFLT_EXPIRATION,
  });
};
