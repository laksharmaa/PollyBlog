export const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
export const wordCount = (text = "") => text.trim() ? text.trim().split(/\s+/).length : 0;
export const readingTime = (text = "") => Math.max(1, Math.ceil(wordCount(text) / 220));
export const formatDate = (value) => { if (!value) return "Recently"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" }); };
