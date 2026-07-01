import type { AnyFieldApi } from "@tanstack/react-form";

interface FieldErrorProps {
  field: AnyFieldApi;
}

export function FieldError({ field }: FieldErrorProps) {
  if (!field.state.meta.isTouched || field.state.meta.isValid) return null;
  return <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p>;
}
