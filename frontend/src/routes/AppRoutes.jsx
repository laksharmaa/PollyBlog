import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/HomePage";
import BlogDetailPage from "../pages/BlogDetailPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CreateBlogPage from "../pages/CreateBlogPage";
import SavedBlogsPage from "../pages/SavedBlogsPage";
import EditBlogPage from "../pages/EditBlogPage";
import TextToSpeechPage from "../pages/TextToSpeechPage";

export default function AppRoutes(props) {
  return (
    <Routes>
      <Route element={<AppLayout {...props} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/public-blog/:blogId" element={<BlogDetailPage />} />
        <Route path="/login" element={<LoginPage onLogin={props.onLogin} />} />
        <Route path="/register" element={<RegisterPage onLogin={props.onLogin} />} />
        <Route element={<ProtectedRoute isAuthenticated={props.isAuthenticated} />}>
          <Route path="/create-blog" element={<CreateBlogPage />} />
          <Route path="/saved-blogs" element={<SavedBlogsPage />} />
          <Route path="/edit-blog/:blogId" element={<EditBlogPage />} />
          <Route path="/text-to-speech" element={<TextToSpeechPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
