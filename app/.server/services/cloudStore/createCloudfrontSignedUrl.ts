import { getSignedUrl } from "@aws-sdk/cloudfront-signer"; // ESM
import { ENV } from "~/.server/ENV";
import { getSecret } from "~/.server/services/secrets/getSecret";

export async function createCloudfrontSignedUrl({
  storagePath,
}: {
  storagePath: string;
}) {
  const date = new Date();

  const url = `${ENV.AWS_CDN_HOST}/${storagePath}`;

  const dateLessThan = date.setDate(date.getDate() + 1);

  const privateKey = await getSecret(ENV.AWS_CDN_SECRET);

  const signedUrl = getSignedUrl({
    dateLessThan,
    keyPairId: ENV.AWS_CDN_PUBLIC_KEY_ID,
    privateKey,
    url,
  });

  return signedUrl;
}
