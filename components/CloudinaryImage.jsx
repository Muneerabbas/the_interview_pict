"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

/**
 * CloudinaryImage — renders Cloudinary images with next-cloudinary
 * for automatic optimizations (f_auto, q_auto) and high-performance placeholders.
 */
export default function CloudinaryImage({ src, alt = "Image", className = "", width, height, style }) {
    const [error, setError] = useState(false);

    // Filter out standard folders/prefix to get the handle (publicId)
    // Cloudinary URLs: https://res.cloudinary.com/<cloud_name>/image/upload/<version>/<public_id>
    const isCloudinary = typeof src === "string" && src.includes("res.cloudinary.com");

    if (!isCloudinary || error) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src || ""}
                alt={alt}
                className={className || "my-6 block max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"}
                width={width}
                height={height}
                style={style}
                onError={(e) => { e.target.style.display = "none"; }}
            />
        );
    }

    return (
        <div className={`relative my-6 block w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
            <CldImage
                src={src}
                alt={alt}
                width={2400}
                height={2400}
                crop="limit"
                sizes="100vw"
                placeholder="blur"
                className="block max-w-full h-auto object-contain"
                style={style}
                onError={() => setError(true)}
                config={{
                    cloud: {
                        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'deb3jdiv3'
                    }
                }}
            />
        </div>
    );
}
