import * as React from "react";
import { cn } from "@/lib/utils";

export interface SimpleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>;
}

export function SimpleSelect({ className, options, ...props }: SimpleSelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
