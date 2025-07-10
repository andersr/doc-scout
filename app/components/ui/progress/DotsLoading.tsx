function AnimatedDot() {
  return <li className="size-2 animate-pulse rounded-full bg-stone-500"></li>;
}

export function DotsLoading() {
  return (
    <ul
      role="alert"
      aria-busy="true"
      aria-live="polite"
      className="flex h-6 items-center gap-1"
      title="loading"
    >
      <AnimatedDot />
      <AnimatedDot />
      <AnimatedDot />
    </ul>
  );
}
