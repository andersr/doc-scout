import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "../../ENV";
import { s3Client } from "../../vendors/aws/s3Client";

export async function getFromBucket(key: string) {
  const command = new GetObjectCommand({
    Bucket: ENV.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return s3Client.send(command);
}
