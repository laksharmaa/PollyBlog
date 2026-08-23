import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import EditorForm from "../components/editor/EditorForm";
import { api } from "../services/api";

export default function EditBlogPage() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/my-blogs")
      .then((blogs) => {
        const match = blogs.find((item) => item.blogId === blogId);
        if (match) setBlog(match);
        else setError("This story could not be found.");
      })
      .catch((err) => setError(err.message));
  }, [blogId]);

  if (error) return <section className="section"><EmptyState title="Couldn’t edit this story" text={error} /></section>;
  if (!blog) return <section className="section"><p className="eyebrow">Loading story</p></section>;

  return (
    <section className="editor-page">
      <div className="editor-top">
        <div><p className="eyebrow">Edit story</p><h1>Shape the next version.</h1></div>
        <button className="back-link" onClick={() => navigate("/saved-blogs")}>Cancel</button>
      </div>
      <EditorForm initialBlog={blog} />
    </section>
  );
}