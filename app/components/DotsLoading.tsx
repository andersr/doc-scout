function AnimatedDot() {
  return <li className="size-2 animate-pulse rounded-full bg-stone-500"></li>;
}

export function DotsLoading() {
  return (
    <ul className="flex h-6 items-center gap-1">
      <AnimatedDot />
      <AnimatedDot />
      <AnimatedDot />
    </ul>
  );
}
