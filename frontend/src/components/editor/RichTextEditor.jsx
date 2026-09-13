import { useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";

export default function RichTextEditor({ value, onChange, onInsertImage, uploading = false }) {
  const editorRef = useRef(null);
  const selectionRef = useRef(null);

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

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  };

  const handleInsertImage = async (file) => {
    const imageMarkup = await onInsertImage?.(file);
    const editor = editorRef.current;
    const range = selectionRef.current;

    if (!imageMarkup || !editor || !range || !editor.contains(range.commonAncestorContainer)) return;

    range.deleteContents();
    range.insertNode(range.createContextualFragment(imageMarkup));
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    update();
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
        onInsertImage={handleInsertImage}
        uploading={uploading}
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
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onFocus={saveSelection}
      />
    </div>
  );
}