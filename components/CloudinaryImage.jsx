"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Generates a Cloudinary blur placeholder URL by injecting a tiny
 * transformation segment (w_10,q_10,e_blur:200) into the image URL.
 */
function getBlurDataURL(src) {
    try {
        return src.replace(/\/upload\//, "/upload/w_10,q_10,e_blur:200/");
    } catch {
        return src;
    }
}

/**
 * CloudinaryImage — renders Cloudinary images with Next.js <Image>
 * using a blur placeholder that fades in while the full image loads.
 * Falls back to a plain <img> for non-Cloudinary URLs.
 */
export default function CloudinaryImage({ src, alt = "Image", className = "" }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const isCloudinary =
        typeof src === "string" && src.includes("res.cloudinary.com");

    // Fallback for non-Cloudinary or errored images
    if (!isCloudinary || error) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src || ""}
                alt={alt}
                className={className || "my-6 w-full rounded-xl border border-slate-200"}
                onError={(e) => { e.target.style.display = "none"; }}
            />
        );
    }

    const blurDataURL = getBlurDataURL(src);

    return (
        <span className="relative my-6 block w-full overflow-hidden rounded-xl border border-slate-200">
            {/* Shimmer skeleton shown until the image loads */}
            {!loaded && (
                <span
                    className="img-shimmer absolute inset-0 block"
                    aria-hidden="true"
                    style={{ minHeight: "200px" }}
                />
            )}
            <Image
                src={src}
                alt={alt}
                width={0}
                height={0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className={`w-full h-auto transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
                    } ${className}`}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />
        </span>
    );
}
