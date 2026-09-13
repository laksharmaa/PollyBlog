import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import { api } from "../../services/api";
import { readingTime, stripHtml, wordCount } from "../../utils/text";
import { assertSupportedImage, readFileAsDataUrl } from "../../utils/image";

export default function EditorForm({ initialBlog = null }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialBlog?.blogTitle || "");
  const [content, setContent] = useState(initialBlog?.blogContent || "<p><br></p>");
  const [publicPost, setPublicPost] = useState(
    initialBlog ? initialBlog.isPublic === true || initialBlog.isPublic === "true" : true,
  );
  const [imageUrl, setImageUrl] = useState(initialBlog?.imageUrl || "");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [editorImageUploading, setEditorImageUploading] = useState(false);

  const plainText = stripHtml(content);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      assertSupportedImage(file);
      setImageError("");
      const dataUrl = await readFileAsDataUrl(file);
      setImageDataUrl(dataUrl);
      setImageUrl(dataUrl);
      setRemoveImageFlag(false);
    } catch (error) {
      setImageError(error.message);
    }
  };

  const handleInsertEditorImage = async (file) => {
    if (!file) return;

    try {
      assertSupportedImage(file);
      setEditorImageUploading(true);
      const dataUrl = await readFileAsDataUrl(file);
      return `<figure class="editor-image"><img src="${dataUrl}" alt="Inserted blog image" /><figcaption></figcaption></figure>`;
    } catch (error) {
      setStatus(error.message);
    } finally {
      setEditorImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageDataUrl("");
    setImageUrl("");
    setRemoveImageFlag(true);
    setImageError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !plainText.trim()) {
      setStatus("Give your story a title and some words.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const payload = {
        blogTitle: title.trim(),
        blogContent: content,
        isPublic: publicPost ? "true" : "false",
      };

      if (imageDataUrl) {
        payload.imageDataUrl = imageDataUrl;
      }

      if (initialBlog?.imageUrl && !imageDataUrl && !imageUrl && removeImageFlag) {
        payload.removeImage = true;
      }

      await api(initialBlog ? `/api/blogs/${initialBlog.blogId}` : "/api/create-blog", {
        method: initialBlog ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      navigate(initialBlog ? "/saved-blogs" : publicPost ? "/" : "/saved-blogs");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="editor" onSubmit={submit}>
      <input
        className="title-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Your title…"
        maxLength={140}
        autoFocus
      />

      <div className="image-upload-panel">
        <div className="image-upload-header">
          <span>Cover image</span>
          <div className="image-upload-actions">
            {imageUrl && (
              <button type="button" className="button secondary small" onClick={handleRemoveImage}>
                Remove
              </button>
            )}
            <label className="button secondary small upload-trigger">
              {imageUrl ? "Change image" : "Upload image"}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {imageError && <p className="form-error">{imageError}</p>}

        {imageUrl && (
          <div className="image-preview">
            <img src={imageUrl} alt="Blog cover preview" />
          </div>
        )}
      </div>

      <div className="editor-rule" />

      <RichTextEditor
        value={content}
        onChange={setContent}
        onInsertImage={handleInsertEditorImage}
        uploading={editorImageUploading}
      />

      <div className="editor-footer">
        <span>
          {wordCount(plainText)} words · {readingTime(plainText)} min read
        </span>

        <div className="editor-actions">
          <label className="visibility">
            <input
              type="checkbox"
              checked={publicPost}
              onChange={(event) => setPublicPost(event.target.checked)}
            />
            <span>{publicPost ? "Public" : "Private draft"}</span>
          </label>

          <button type="submit" className="publish-button" disabled={saving}>
            {saving ? "Saving…" : initialBlog ? "Save changes" : "Publish story"}
          </button>
        </div>
      </div>

      {status && <p className="form-error">{status}</p>}
    </form>
  );
}