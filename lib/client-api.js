export async function readJson(response, fallback = null) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text.trim() || !contentType.toLowerCase().includes("application/json")) {
    return fallback;
  }

  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function requestJson(input, init = {}, fallback = null) {
  const response = typeof Response !== "undefined" && input instanceof Response
    ? input
    : await fetch(input, init);
  const data = await readJson(response, fallback);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  }

  return data;
}
