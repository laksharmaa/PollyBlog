import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import EmptyState from "../components/common/EmptyState";
import { ArticleSkeleton } from "../components/common/Skeleton";
import ListenPanel from "../components/blog/ListenPanel";
import { formatDate, readingTime, stripHtml } from "../utils/text";

export default function BlogDetailPage() {
	const { blogId } = useParams();
	const [blog, setBlog] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		api(`/api/public-blog/${blogId}`)
			.then(setBlog)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [blogId]);

	if (loading) return <div className="reading-page"><ArticleSkeleton /></div>;
	if (error || !blog) {
		return <div className="reading-page"><EmptyState title="Story not found" text={error || "This story may have been removed."} /></div>;
	}

	const content = stripHtml(blog.blogContent);
	return (
		<article className="reading-page">
			<a className="back-link" href="/">Back to stories</a>
			<div className="article-header">
				<p className="eyebrow">Published story</p>
				<h1>{blog.blogTitle || "Untitled story"}</h1>
				<div className="article-byline">
					<span>By {blog.username || "Anonymous"}</span>
					<span>·</span>
					<span>{formatDate(blog.createdAt)}</span>
					<span>·</span>
					<span>{readingTime(content)} min read</span>
				</div>
			</div>
			<div className="article-layout">
				<div className="article-body">
					{content.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
				</div>
				<ListenPanel blog={blog} isAuthenticated={Boolean(localStorage.getItem("token"))} />
			</div>
		</article>
	);
}
