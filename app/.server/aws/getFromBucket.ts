import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { ScrapeData } from "~/types/doc";
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

export async function getBucketData(paths: string[]): Promise<ScrapeData[]> {
  const data: ScrapeData[] = [];

  for (let index = 0; index < paths.length; index++) {
    const res = await getFromBucket(paths[index]);
    // console.log("res: ", res);

    if (res.$metadata.httpStatusCode !== 200 || !res.Body) {
      throw new Error("error getting data from bucket");
    }
    const bodyString = await res?.Body?.transformToString();
    // console.log("bodyString: ", bodyString);

    const sourceData: ScrapeData = JSON.parse(bodyString);

    data.push(sourceData);
  }

  return data;
}
