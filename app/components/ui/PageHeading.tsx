import { PageTitle } from "~/components/page-title";

interface Props {
  children?: React.ReactNode;
  pageTitle: string;
}

export function PageHeading({ children, pageTitle }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2 pb-6">
      <PageTitle title={pageTitle} />
      {children}
    </div>
  );
}
