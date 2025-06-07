import { setWindowTitle } from "~/utils/setWindowTitle";

// TODO: rename file back to PageTitle
export function PageTitle({ title }: { title: string }) {
  return (
    <>
      <title>{setWindowTitle(title)}</title>
      <h1 className="text-3xl leading-tight text-stone-600 font-stretch-75% md:text-5xl md:font-semibold md:font-stretch-50%">
        {title}
      </h1>
    </>
  );
}
