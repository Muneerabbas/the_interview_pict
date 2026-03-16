"use client";

import { useState } from "react";

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default function SafeOptionalImage({
  src,
  alt,
  className = "",
  onErrorHide = true,
  fallback = null,
}) {
  const [hidden, setHidden] = useState(false);
  const safeSrc = normalize(src);

  if (!safeSrc || hidden) {
    return fallback;
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (onErrorHide) setHidden(true);
      }}
    />
  );
}
