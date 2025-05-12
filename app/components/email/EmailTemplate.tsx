import * as E from "@react-email/components";
import { render } from "@react-email/render";
import { Fragment } from "react";

import { EmailCTA } from "./EmailParts";
import { EmailTailwindContainer } from "./EmailTailwindContainer";

export interface EmailConfig {
  title: string;
  textLines: string[];
  ctaLabel?: string;
  ctaUrl?: string;
}

export function EmailTemplate({
  title,
  ctaUrl,
  textLines,
  ctaLabel,
}: EmailConfig) {
  return (
    <EmailTailwindContainer>
      <Fragment>
        <E.Html lang="en" dir="ltr">
          <E.Head />
          <E.Body className="text-black">
            <E.Container>
              {/* <E.Row>
                <E.Img
                  src={"https://app.starlinghome.co/images/starling-logo.png"}
                  alt="Starling Logo"
                  width="135"
                  height="16"
                />
              </E.Row> */}
              <E.Heading as="h1" className="my-12 text-4xl leading-normal">
                {title}
              </E.Heading>
              {textLines.map((t, index) => (
                <E.Text
                  key={index.toString()}
                  className="mb-6 whitespace-pre-line text-black"
                >
                  {t}
                </E.Text>
              ))}
              {ctaUrl && ctaLabel && (
                <EmailCTA href={ctaUrl}>{ctaLabel}</EmailCTA>
              )}
              <E.Hr className="mb-12" />
              {/* <EmailFooterAddress /> */}
            </E.Container>
          </E.Body>
        </E.Html>
      </Fragment>
    </EmailTailwindContainer>
  );
}

export function renderEmail(props: EmailConfig) {
  return render(<EmailTemplate {...props} />);
}
