import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "../ENV";
import { s3Client } from "./s3Client";

/**
 * Uploads JSON data to an S3 bucket
 * @param key The S3 object key (file path)
 * @param data The data to upload as JSON
 * @returns Promise resolving to the S3 response
 */
export async function uploadJsonToBucket(key: string, data: unknown) {
  const command = new PutObjectCommand({
    Body: JSON.stringify(data, null, 2),
    Bucket: ENV.AWS_DATA_BUCKET_NAME,
    ContentType: "application/json",
    Key: key,
  });

  return s3Client.send(command);
}
