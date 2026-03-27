"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';

const ProfileAvatar = ({ src, alt, className, name }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset error/load state only when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  const { initials, bgColor } = useMemo(() => {
    const textToUse = name || alt || "";
    if (!textToUse) return { initials: "", bgColor: "bg-slate-200" };

    const parts = textToUse.trim().split(/\s+/);
    const initialsStr = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 1).toUpperCase();

    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-indigo-500",
      "bg-violet-500", "bg-rose-500", "bg-amber-500",
      "bg-cyan-500", "bg-teal-500"
    ];
    const colorIdx = (textToUse.length) % colors.length;
    return { initials: initialsStr, bgColor: colors[colorIdx] };
  }, [name, alt]);

  const showImage = src && !src.includes("api/placeholder") && !imageError;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
      {/* Absolute Fallback Layer (Base) */}
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-white uppercase shadow-inner ${bgColor}`}>
        {initials ? initials : <User className="w-1/2 h-1/2 opacity-80" strokeWidth={1.5} />}
      </div>

      {/* Image Layer - Fades in on top */}
      {showImage && (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;
