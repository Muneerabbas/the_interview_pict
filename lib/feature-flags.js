/**
 * Tales (student stories) is built but not ready to ship. Every tales surface --
 * nav target, home section, /tales listing, the post-type toggle, single-post
 * rendering, sitemap, profile and notification listings -- is gated on this flag,
 * so bringing the feature back is a one-line change.
 *
 * The API routes stay live either way; nothing in the UI calls them while this is
 * false. next-sitemap.config.js keeps its own copy (CommonJS, cannot import ESM).
 */
export const TALES_ENABLED = false;
