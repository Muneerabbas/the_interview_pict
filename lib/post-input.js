import { TALE_CATEGORIES } from "@/lib/tale-categories";

/**
 * Shared validation for post fields.
 *
 * /api/saveExp enforced these rules on create while /api/edit blind-copied
 * whatever the body contained, so an edit could launder past every one of them:
 * a 10,000-element tag array, an arbitrary `category` string into the public
 * category filter, or a non-string `company` that breaks equality matching in
 * the feed. Both routes now share this module.
 */
export const MAX_EXP_TEXT = 200_000; // ~200KB of markdown; BSON caps a document at 16MB
export const MAX_TAGS = 6;
export const MAX_TAG_LENGTH = 40;
export const MAX_SHORT_FIELD = 200;

export function normalizeShortText(value, max = MAX_SHORT_FIELD) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.map((tag) => normalizeShortText(tag, MAX_TAG_LENGTH)).filter(Boolean))].slice(0, MAX_TAGS);
}

export function normalizeCategory(category, isTale) {
  return isTale && TALE_CATEGORIES.includes(category) ? category : "";
}

/** Returns an error string, or null when the body text is acceptable. */
export function validateExpText(expText) {
  if (typeof expText !== "string" || !expText.trim()) return "Content (exp_text) is required";
  if (expText.length > MAX_EXP_TEXT) return "Content is too long";
  return null;
}
