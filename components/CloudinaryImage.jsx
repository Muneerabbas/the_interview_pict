"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

/**
 * CloudinaryImage — renders Cloudinary images with next-cloudinary
 * for automatic optimizations (f_auto, q_auto) and high-performance placeholders.
 */
export default function CloudinaryImage({ src, alt = "Image", className = "", width, height, style }) {
    const [error, setError] = useState(false);
    const [broken, setBroken] = useState(false);

    // Filter out standard folders/prefix to get the handle (publicId)
    // Cloudinary URLs: https://res.cloudinary.com/<cloud_name>/image/upload/<version>/<public_id>
    const isCloudinary = typeof src === "string" && src.includes("res.cloudinary.com");

    // The cloud name is already in the source URL. Deriving it from `src` keeps
    // images working no matter which account they were uploaded to; the env var
    // is only the fallback. (The previous code read the unprefixed
    // CLOUDINARY_CLOUD_NAME, which is never present in a client bundle, so every
    // image silently used the hardcoded literal instead.)
    const cloudName =
        (isCloudinary && src.match(/res\.cloudinary\.com\/([^/]+)\//)?.[1]) ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "dbbrsoiol";

    if (!isCloudinary || error) {
        // Render nothing rather than a broken-image glyph. The old handler set
        // e.target.style.display directly, which React undid on the next render.
        if (broken) return null;

        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src || ""}
                alt={alt}
                className={className || "my-6 block max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"}
                width={width}
                height={height}
                style={style}
                onError={() => setBroken(true)}
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
                className="block max-w-full h-auto object-contain"
                style={style}
                onError={() => setError(true)}
                config={{ cloud: { cloudName } }}
            />
        </div>
    );
}
