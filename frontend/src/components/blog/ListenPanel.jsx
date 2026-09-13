import { useState } from "react";
import Icon from "../common/Icon";
import { api } from "../../services/api";
import { stripHtml } from "../../utils/text";

export default function ListenPanel({ blog, isAuthenticated }) {
	const [voice, setVoice] = useState("Matthew");
	const [audioUrls, setAudioUrls] = useState([]);
	const [audioIndex, setAudioIndex] = useState(0);
	const [speaking, setSpeaking] = useState(false);
	const [error, setError] = useState("");

	const narrate = async () => {
		if (!isAuthenticated) return window.location.assign("/login");
		setSpeaking(true);
		setError("");
		try {
			const data = await api("/api/speech", {
				method: "POST",
				body: JSON.stringify({ text: stripHtml(blog.blogContent), voiceId: voice, blogId: blog.blogId }),
			});
			setAudioUrls(data.audioUrls || [data.audioUrl]);
			setAudioIndex(0);
		} catch (error) {
			setError(error.message);
		} finally {
			setSpeaking(false);
		}
	};

	return <aside className="listen-panel"><div className="listen-label"><Icon name="volume" /> Narrate this story</div><p>Let a synthetic voice read the words back to you.</p><select value={voice} onChange={(event) => setVoice(event.target.value)}><option>Matthew</option><option>Joanna</option><option>Kendra</option><option>Ivy</option></select><button className="button dark-button full" onClick={narrate} disabled={speaking}><Icon name={speaking ? "pause" : "play"} />{speaking ? "Generating…" : "Listen"}</button>{!isAuthenticated && <small>Sign in to use Narrate.</small>}{error && <p className="form-error">{error}</p>}{audioUrls.length > 0 && <audio controls autoPlay src={audioUrls[audioIndex]} onEnded={() => setAudioIndex((index) => Math.min(index + 1, audioUrls.length - 1))} />}</aside>;
}
