export function stripHtml(html = "") {
  if (!html) return "";

  const container = document.createElement("div");

  container.innerHTML = html;

  return (container.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(text = "") {
  return text.trim()
    ? text.trim().split(/\s+/).length
    : 0;
}

export function readingTime(text = "") {
  return Math.max(
    1,
    Math.ceil(wordCount(text) / 220)
  );
}

export function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}