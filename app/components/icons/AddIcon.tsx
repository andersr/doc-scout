export function AddIcon({ color, size }: { color?: string; size: number }) {
  const sizePx = `${size}px`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={sizePx}
      viewBox="0 -960 960 960"
      fill={color ?? "#000"}
    >
      <desc>Plus (Add) Icon</desc>
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
}
