import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import { api } from "../../services/api";
import {
    readingTime,
    stripHtml,
    wordCount,
} from "../../utils/text";

export default function EditorForm() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("<p><br></p>");
    const [publicPost, setPublicPost] = useState(true);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);

    const plainText = stripHtml(content);

    const submit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !plainText.trim()) {
            setStatus("Give your story a title and some words.");
            return;
        }

        setSaving(true);
        setStatus("");

        try {
            await api.createBlog({
                blogTitle: title.trim(),

                // Store formatted HTML
                blogContent: content,

                isPublic: publicPost ? "true" : "false",
            });

            navigate(publicPost ? "/" : "/saved-blogs");
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

            <div className="editor-rule" />

            <RichTextEditor
                value={content}
                onChange={setContent}
            />

            <div className="editor-footer">
                <span>
                    {wordCount(plainText)} words ·{" "}
                    {readingTime(plainText)} min read
                </span>

                <div className="editor-actions">
                    <label className="visibility">
                        <input
                            type="checkbox"
                            checked={publicPost}
                            onChange={(event) =>
                                setPublicPost(event.target.checked)
                            }
                        />

                        <span>
                            {publicPost ? "Public" : "Private draft"}
                        </span>
                    </label>

                    <button
                        type="submit"
                        className="publish-button"
                        disabled={saving}
                    >
                        {saving ? "Publishing…" : "Publish story"}
                    </button>
                </div>
            </div>

            {status && (
                <p className="form-error">
                    {status}
                </p>
            )}
        </form>
    );
}