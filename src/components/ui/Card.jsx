export function Card({ variant = "base", className = "", children, ...props }) {
  const variantClasses = {
    base: "card-base",
    cyan: "card-cyan",
    green: "card-green",
    red: "card-red",
    amber: "card-amber",
  };

  return (
    <div className={`${variantClasses[variant] || variantClasses.base} p-6 transition-smooth ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`mb-4 pb-4 border-b border-border-light ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`text-heading-md text-text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}