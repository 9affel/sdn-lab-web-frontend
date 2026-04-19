import clsx from "clsx";

function Badge({ variant = "info", children, className = "", ...props }) {
  const variants = {
    cyan: "badge-cyan",
    green: "badge-green",
    red: "badge-red",
    amber: "badge-amber",
    info: "badge-cyan",
    success: "badge-green",
    danger: "badge-red",
    warning: "badge-amber",
  };

  return (
    <span
      className={clsx("badge-base", variants[variant] || variants.info, className)}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export default Badge;