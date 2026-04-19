import clsx from "clsx";

export default function Input({
  size = "md",
  error = false,
  disabled = false,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <input
      className={clsx(
        "input-base",
        sizes[size] || sizes.md,
        error && "border-red/50 focus:border-red focus:ring-red/20",
        disabled && "opacity-50 cursor-not-allowed bg-bg-deep",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}