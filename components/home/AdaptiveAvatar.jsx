"use client";

import { useMemo, useState } from "react";
import { normalizeText } from "./homeUtils";

export default function AdaptiveAvatar({
  src,
  alt,
  fallbackText,
  className = "",
  textClassName = "text-white",
  fallbackClassName = "bg-gradient-to-br from-slate-500 to-slate-700",
}) {
  const [hasError, setHasError] = useState(false);

  const safeSrc = normalizeText(src);
  const shouldShowImage = Boolean(safeSrc) && !hasError;

  const initials = useMemo(() => {
    const text = normalizeText(fallbackText, "U");
    const parts = text.split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [fallbackText]);

  if (shouldShowImage) {
    return (
      <img
        src={safeSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`${className} ${fallbackClassName} flex items-center justify-center`}>
      <span className={`${textClassName} font-black`}>{initials}</span>
    </div>
  );
}
