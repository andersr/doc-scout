import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secretsMgrClient } from "~/.server/vendors/aws/secretsMgrClient";

export async function getSecret(name: string) {
  try {
    const response = await secretsMgrClient.send(
      new GetSecretValueCommand({
        SecretId: name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      }),
    );

    const secret = response.SecretString;

    if (!secret) {
      throw new Error("no secret returned");
    }

    return secret;
  } catch (error) {
    console.error("get secret error: ", error);
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    return "";
  }
}
