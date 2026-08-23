import { useEffect, useState } from "react";
import EmptyState from "../components/common/EmptyState";
import { StorySkeleton } from "../components/common/Skeleton";
import StoryCard from "../components/blog/StoryCard";
import { api } from "../services/api";

export default function SavedBlogsPage() {
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		api("/api/my-blogs")
			.then((data) => setBlogs(Array.isArray(data) ? data : []))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	const updateVisibility = async (blog) => {
		const isPublic = blog.isPublic === true || blog.isPublic === "true";
		try {
			await api(`/api/blogs/${blog.blogId}`, {
				method: "PUT",
				body: JSON.stringify({ blogTitle: blog.blogTitle, blogContent: blog.blogContent, isPublic: !isPublic }),
			});
			setBlogs((current) => current.map((item) => item.blogId === blog.blogId
				? { ...item, isPublic: isPublic ? "false" : "true" }
				: item));
		} catch (err) {
			setError(err.message);
		}
	};

	const deleteBlog = async (blogId) => {
		if (!window.confirm("Delete this story permanently?")) return;
		try {
			await api(`/api/blogs/${blogId}`, { method: "DELETE" });
			setBlogs((current) => current.filter((blog) => blog.blogId !== blogId));
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<section className="section library-page">
			<div className="section-heading"><div><p className="eyebrow">Your writing</p><h1>Library</h1></div><a className="button primary" href="/create-blog">+ New story</a></div>
			{error ? <EmptyState title="Couldn’t load your library" text={error} /> : loading ? <div className="story-grid">{[1, 2, 3].map((item) => <StorySkeleton key={item} />)}</div> : blogs.length ? <div className="story-grid">
				{blogs.map((blog) => <div className="saved-wrap" key={blog.blogId}>
					  <StoryCard blog={blog} href={`/edit-blog/${blog.blogId}`} />
					<div className="blog-actions">
						<span className="visibility-status">{blog.isPublic === true || blog.isPublic === "true" ? "Public" : "Private"}</span>
						<a className="text-link" href={`/edit-blog/${blog.blogId}`}>Edit</a>
						<button className="text-button" onClick={() => updateVisibility(blog)}>{blog.isPublic === true || blog.isPublic === "true" ? "Make private" : "Make public"}</button>
						<button className="text-button danger" onClick={() => deleteBlog(blog.blogId)}>Delete</button>
					</div>
				</div>)}
			</div> : <EmptyState title="Your library is empty." text="Your published stories and private drafts will appear here." action="Write a story" />}
		</section>
	);
}
