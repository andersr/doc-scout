import {
  PDFServices,
  ServicePrincipalCredentials,
} from "@adobe/pdfservices-node-sdk";
import { ENV } from "~/.server/ENV";
const credentials = new ServicePrincipalCredentials({
  clientId: ENV.ADOBE_PDF_SERVICES_CLIENT_ID,
  clientSecret: ENV.ADOBE_PDF_SERVICES_CLIENT_SECRET,
});

export const pdfClient = new PDFServices({ credentials });
