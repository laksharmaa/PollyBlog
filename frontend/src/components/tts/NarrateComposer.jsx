import { useState } from "react";
import Icon from "../common/Icon";
import { api } from "../../services/api";
import { readingTime, wordCount } from "../../utils/text";
const MAX_SYNCHRONOUS_TEXT_LENGTH = 3000;

export default function NarrateComposer() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Matthew");
  const [audioUrls, setAudioUrls] = useState([]);
  const [audioIndex, setAudioIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const convert = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return setError("Add some text first.");
    setBusy(true);
    setError("");

    try {
      const d = await api("/api/speech", {
        method: "POST",
        body: JSON.stringify({ text: trimmedText, voiceId: voice }),
      });
      setAudioUrls(d.audioUrls || [d.audioUrl]);
      setAudioIndex(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="narrate-card">
      <div className="narrate-toolbar">
        <span>
          {wordCount(text)} words · {text.length}/{MAX_SYNCHRONOUS_TEXT_LENGTH} characters
        </span>
        <select value={voice} onChange={(e) => setVoice(e.target.value)}>
          <option>Matthew</option>
          <option>Joanna</option>
          <option>Kendra</option>
          <option>Ivy</option>
        </select>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your writing here…"
      />
      <div className="narrate-bottom">
        <span>{readingTime(text)} min estimated listening time</span>
        <button
          className="button dark-button"
          onClick={convert}
          disabled={busy}
        >
          <Icon name="volume" />
          {busy ? "Generating…" : "Generate voice"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {audioUrls.length > 0 && (
        <audio
          className="audio"
          controls
          autoPlay
          src={audioUrls[audioIndex]}
          onEnded={() => setAudioIndex((index) => Math.min(index + 1, audioUrls.length - 1))}
        />
      )}
    </div>
  );
}
