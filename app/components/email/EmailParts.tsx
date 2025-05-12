import * as E from "@react-email/components";

// export function EmailFooterAddress() {
//   return (
//     <E.Container className="text-sm">
//       <E.Text className="m-0 text-black">Starling Home</E.Text>
//       <E.Text className="m-0 text-grey-4">
//         45 Montgomery St, Tivoli, NY 12583
//       </E.Text>
//     </E.Container>
//   );
// }

export function EmailCTA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <E.Button
      className="mb-3 rounded bg-light-blue p-3 text-base font-medium text-dark-blue"
      href={href}
    >
      {children}
    </E.Button>
  );
}
