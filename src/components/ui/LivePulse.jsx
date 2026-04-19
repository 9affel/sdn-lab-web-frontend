function LivePulse({ danger = false, size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const colorClass = danger ? "bg-red" : "bg-green";
  const animationClass = danger ? "animate-ping-soft" : "animate-ping-soft";

  return (
    <div className={`relative inline-flex items-center justify-center ${ sizeMap[size]} ${className}`}>
      {/* Outer animated ring */}
      <div
        className={`absolute inset-0 rounded-full ${colorClass} opacity-75 ${animationClass}`}
      ></div>
      {/* Inner solid dot */}
      <div className={`relative ${sizeMap[size]} rounded-full ${colorClass}`}></div>
    </div>
  );
}

export { LivePulse };
export default LivePulse;