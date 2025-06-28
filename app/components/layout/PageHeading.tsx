import { PageTitle } from "~/components/layout/PageTitle";

interface Props {
  headingContent?: React.ReactNode;
  pageTitle: string;
}

export function PageHeading({ headingContent, pageTitle }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <PageTitle title={pageTitle} />
      {headingContent}
    </div>
  );
}
