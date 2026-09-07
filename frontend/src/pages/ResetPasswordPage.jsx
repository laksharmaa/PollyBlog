import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthPage from "../components/auth/AuthPage";
import AuthField from "../components/auth/AuthField";
import { api } from "../services/api";

export default function ResetPasswordPage() {
  const token = new URLSearchParams(useLocation().search).get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(token ? "" : "This reset link is missing its token.");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmation) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      await api("/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
      navigate("/login", { state: { message: "Password reset. You can sign in now." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthPage eyebrow="New password" title="Start fresh." subtitle="Choose a new password for your Narrate account.">
    <form className="auth-form" onSubmit={submit}>
      <AuthField label="New password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <AuthField label="Confirm password" type="password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
      {error && <p className="form-error">{error}</p>}
      <button className="button primary full" disabled={loading || !token}>{loading ? "Updating…" : "Update password"}</button>
      <p className="auth-switch"><a href="/login">Back to sign in</a></p>
    </form>
  </AuthPage>;
}
