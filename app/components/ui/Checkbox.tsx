import { twMerge } from "tailwind-merge";

export function Checkbox({
  checked,
  children,
  customStyle,
  disabled,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  children: React.ReactNode;
  customStyle?: string;
  disabled?: boolean;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
}) {
  return (
    <label
      className={twMerge(
        "cursor-pointer",
        disabled ? "text-opacity-60 text-black" : "",
        customStyle,
      )}
    >
      <input
        type="checkbox"
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
