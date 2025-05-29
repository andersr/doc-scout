import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../aws/s3Client";
import { ENV } from "../ENV";

export async function uploadFileToS3({
  file,
  key,
}: {
  file: File;
  key: string;
}): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const command = new PutObjectCommand({
    Body: buffer,
    Bucket: ENV.AWS_DATA_BUCKET_NAME,
    ContentType: file.type,
    Key: key,
  });

  await s3Client.send(command);

  return key;
}
