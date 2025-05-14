import { twMerge } from "tailwind-merge";

export function Checkbox({
  name,
  children,
  disabled,
  onChange,
  checked,
  value,
  customStyle,
}: {
  children: React.ReactNode;
  name?: string;
  value?: string | number;
  disabled?: boolean;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customStyle?: string;
}) {
  return (
    <label
      className={twMerge(
        "cursor-pointer",
        disabled ? "text-black text-opacity-60" : "",
        customStyle,
      )}
    >
      <input
        type="checkbox"
        data-slot="checkbox"
        className="mr-3 cursor-pointer disabled:opacity-70"
        checked={checked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
      />
      {children}
    </label>
  );
}
