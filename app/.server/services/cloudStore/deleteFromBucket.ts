import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "~/.server/ENV";
import { s3Client } from "~/.server/vendors/aws/s3Client";

export async function deleteFromBucket(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: ENV.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return s3Client.send(command);
}
