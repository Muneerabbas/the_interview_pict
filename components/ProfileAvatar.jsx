"use client";
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

function buildInitials(value) {
  if (typeof value !== "string") return "";
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const ProfileAvatar = ({ src, alt, className, fallbackText = "" }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const safeSrc = typeof src === "string" ? src.trim() : "";
  const initials = buildInitials(fallbackText || alt);

  // Check if src is available, not a placeholder, and didn't error
  const isValidSource = safeSrc && !safeSrc.includes("api/placeholder") && !imageError;

  if (!isValidSource) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 ${className}`}>
        {initials ? (
          <span className="text-[0.6em] font-bold tracking-wide">{initials}</span>
        ) : (
          <User className="w-3/5 h-3/5" strokeWidth={1.8} />
        )}
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProfileAvatar;
