import { useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value || "<p><br></p>";
    }
  }, [value]);

  const update = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleKeyDown = (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "b"
    ) {
      event.preventDefault();

      document.execCommand("bold");

      update();
    }

    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "i"
    ) {
      event.preventDefault();

      document.execCommand("italic");

      update();
    }
  };

  return (
    <div className="rich-editor">
      <EditorToolbar
        editorRef={editorRef}
        onChange={update}
      />

      <div
        ref={editorRef}
        className="rich-editor-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder="Start writing…"
        onInput={update}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}