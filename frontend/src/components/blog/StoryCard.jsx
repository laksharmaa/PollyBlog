import { motion } from "framer-motion";
import { formatDate, readingTime, stripHtml } from "../../utils/text";
export default function StoryCard({ blog, featured = false, href }) {
	const excerpt = stripHtml(blog.blogContent);
	return (
		<motion.a whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={featured ? "story-card featured" : "story-card"} href={href || `/public-blog/${blog.blogId}`}>
			<div className="card-meta"><span>{featured ? "Featured" : "Story"}</span><span>{readingTime(excerpt)} min read</span></div>
			<h3>{blog.blogTitle || "Untitled story"}</h3>
			<p>{excerpt.slice(0, featured ? 250 : 170)}{excerpt.length > (featured ? 250 : 170) ? "…" : ""}</p>
			<div className="card-footer"><span>By {blog.username || "Anonymous"}</span><span>{formatDate(blog.createdAt)}</span></div>
		</motion.a>
	);
}