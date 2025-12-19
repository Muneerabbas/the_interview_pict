"use client";
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const ProfileAvatar = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Check if src is available, not a placeholder, and didn't error
  const isValidSource = src && !src.includes("api/placeholder") && !imageError;

  if (!isValidSource) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <User className="w-3/5 h-3/5" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ProfileAvatar;

