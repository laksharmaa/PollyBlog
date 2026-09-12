import { api } from "../services/api";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

export function assertSupportedImage(file) {
  if (!file || !SUPPORTED_TYPES.includes(file.type)) {
    throw new Error("Please choose a valid JPG, PNG, or WebP image.");
  }
}

/**
 * Uploads an image the user is inserting into the story body (as opposed
 * to the single cover image, which is sent along with the blog itself).
 * Returns the public URL to embed as an <img src>.
 */
export async function uploadEditorImage(file) {
  assertSupportedImage(file);

  const imageDataUrl = await readFileAsDataUrl(file);
  const result = await api("/api/upload-image", {
    method: "POST",
    body: JSON.stringify({ imageDataUrl }),
  });

  return result.url;
}