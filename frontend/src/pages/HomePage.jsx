import { useEffect, useState } from "react";
import { api } from "../services/api";
import EmptyState from "../components/common/EmptyState";
import StoryGrid from "../components/blog/StoryGrid";

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/public-blogs")
      .then((d) => setBlogs(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <p className="eyebrow">PollyBlog / Explore</p>
        <h1>
          Stories worth
          <br />
          <em>spending time with.</em>
        </h1>
        <p className="hero-copy">
          A place for thoughtful writing, personal notes, and ideas from the
          community.
        </p>
        <div className="hero-actions">
            <a className="button primary" href="/create-blog">
                Start writing <span>→</span>
            </a>
            <a className="text-link" href="#stories">
                Browse stories
            </a>
        </div>
      </section>

      <section id="stories" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">From the community</p>
            <h2>Latest stories</h2>
          </div>
          <span className="muted">{blogs.length} published</span>
        </div>

        {error ? (
          <EmptyState title="Couldn’t load the stories" text={error} />
        ) : blogs.length || loading ? (
          <StoryGrid blogs={blogs} loading={loading} />
        ) : (
          <EmptyState
            title="The page is quiet."
            text="Be the first person to publish something."
            action="Write a story"
          />
        )}
      </section>
    </div>
  );
}