interface Props {
  children: React.ReactNode;
}

export function BaseLayout({ children }: Props) {
  return <div className="flex h-full flex-col px-6 pt-2 pb-6">{children}</div>;
}
