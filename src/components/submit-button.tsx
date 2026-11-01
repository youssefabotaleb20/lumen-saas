"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { buttonClass } from "./ui";

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ComponentProps<"button"> & { pendingText: string; variant?: "primary" | "secondary" | "ghost" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
      className={buttonClass(variant, className)}
      {...props}
    >
      {pending ? pendingText : children}
    </button>
  );
}
