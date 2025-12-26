import { cn } from "@/utils/cn";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "default" | "sm" | "icon";
  className?: string;
  ariaLabel?: string;
}

export function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  size = "default",
  className,
  ariaLabel,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
  };

  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
    icon: "p-1.5 text-xs",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
