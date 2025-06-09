import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "../ENV";
import { s3Client } from "./s3Client";

/**
 * Get data from S3 bucket
 * @param key The S3 object key (file path)
 * @returns Promise resolving to the S3 response
 */
export async function getFromBucket(key: string) {
  const command = new GetObjectCommand({
    Bucket: ENV.AWS_DATA_BUCKET_NAME,
    Key: key,
  });

  return s3Client.send(command);
}
