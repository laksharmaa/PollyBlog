import logo from "../../assets/logo.png";

export default function EmptyState({ title, text, action }) {
	return (
		<div className="empty">
			<img className="empty-logo" src={logo} alt="PollyBlog" />
			<h3>{title}</h3>
			<p>{text}</p>
			{action && <a className="button primary" href="/create-blog">{action} <span>→</span></a>}
		</div>
	);
}
