"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export const Checkbox = ({ checked, onChange, label, id }: CheckboxProps) => (
  <button
    type="button"
    id={id}
    role="checkbox"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground"
  >
    <div
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all ${
        checked
          ? "border-shelvitas-green bg-shelvitas-green text-background"
          : "border-secondary bg-secondary/30"
      }`}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </div>
    {label}
  </button>
);
