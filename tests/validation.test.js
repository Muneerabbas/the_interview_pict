import test from "node:test";
import assert from "node:assert/strict";
import {
  hasRequiredFields,
  isValidEmail,
  parsePositiveInt,
  trimString,
} from "../lib/server/validation.js";

test("parsePositiveInt returns defaults and bounds values", () => {
  assert.equal(parsePositiveInt(undefined, 10, 0), 10);
  assert.equal(parsePositiveInt("", 10, 0), 10);
  assert.equal(parsePositiveInt("15", 10, 0), 15);
  assert.equal(parsePositiveInt("-2", 10, 0), 0);
  assert.equal(parsePositiveInt("abc", 10, 0), 10);
});

test("isValidEmail validates email format", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("user@example"), false);
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail(null), false);
});

test("trimString normalizes non-string values", () => {
  assert.equal(trimString("  hello  "), "hello");
  assert.equal(trimString(123), "");
  assert.equal(trimString(undefined), "");
});

test("hasRequiredFields checks for non-empty required keys", () => {
  const body = { uid: "abc", email: "me@example.com", value: "test" };
  assert.equal(hasRequiredFields(body, ["uid", "email"]), true);
  assert.equal(hasRequiredFields({ uid: "abc", email: " " }, ["uid", "email"]), false);
  assert.equal(hasRequiredFields({ uid: "abc" }, ["uid", "email"]), false);
});
