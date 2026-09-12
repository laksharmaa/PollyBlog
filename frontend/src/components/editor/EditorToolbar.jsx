import Icon from "../common/Icon";

const tools = [
  { action: "formatBlock", value: "p", label: "¶", title: "Paragraph" },
  { action: "formatBlock", value: "h2", label: "H2", title: "Heading" },
  { action: "formatBlock", value: "h3", label: "H3", title: "Subheading" },
  { action: "bold", label: "B", title: "Bold" },
  { action: "italic", label: "I", title: "Italic" },
  {
    action: "formatBlock",
    value: "blockquote",
    label: "“",
    title: "Quote",
  },
  {
    action: "insertUnorderedList",
    label: "•",
    title: "Bulleted list",
  },
  {
    action: "insertOrderedList",
    label: "1.",
    title: "Numbered list",
  },
];

export default function EditorToolbar({ editorRef, onChange, onInsertImage, uploading }) {
  const run = (action, value) => {
    editorRef.current?.focus();

    document.execCommand(action, false, value || null);

    onChange?.();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow selecting the same file again later
    if (file) onInsertImage?.(file);
  };

  const addLink = () => {
    editorRef.current?.focus();

    const url = window.prompt("Enter the URL");

    if (!url) return;

    document.execCommand("createLink", false, url);

    onChange?.();
  };

  const addDivider = () => {
    editorRef.current?.focus();

    document.execCommand("insertHorizontalRule");

    onChange?.();
  };

  return (
    <div className="editor-toolbar" role="toolbar">
      <div className="toolbar-group">
        {tools.map((tool) => (
          <button
            key={`${tool.action}-${tool.value || tool.label}`}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(tool.action, tool.value)}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <label
          className={`toolbar-image-trigger${uploading ? " is-uploading" : ""}`}
          title="Add image"
          aria-label="Add image"
          onMouseDown={(event) => event.preventDefault()}
        >
          <Icon name="image" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
          />
        </label>

        <button
          type="button"
          title="Add link"
          aria-label="Add link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
        >
          🔗
        </button>

        <button
          type="button"
          title="Divider"
          aria-label="Divider"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addDivider}
        >
          <Icon name="minus" />
        </button>
      </div>
    </div>
  );
}