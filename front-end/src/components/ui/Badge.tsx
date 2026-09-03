// Flexible Badge / pill used for statuses, tags and role labels.

import type { ReactNode } from "react";

type Tone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "indigo";

const TONES: Record<Tone, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-gray-200 text-gray-600",
  indigo: "bg-indigo-100 text-indigo-700",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

/** Map an order status string to a badge tone. */
export function orderStatusTone(status: string): Tone {
  switch (status) {
    case "Delivered":
      return "success";
    case "Shipped":
      return "info";
    case "Confirmed":
      return "indigo";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function Badge({ tone = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
