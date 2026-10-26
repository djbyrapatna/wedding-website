"use client";
import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };
export default function LabeledInput({
  label,
  id,
  className,
  ...props
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block font-sans text-sm font-medium text-charcoal"
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={className ?? "mt-1 w-full rounded border p-3"}
      />
    </div>
  );
}
