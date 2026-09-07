import { useState } from "react";
import AuthPage from "../components/auth/AuthPage";
import AuthField from "../components/auth/AuthField";
import { api } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthPage eyebrow="Account recovery" title="Find your way back." subtitle="We will send a secure password reset link to your email.">
    <form className="auth-form" onSubmit={submit}>
      <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
      <button className="button primary full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
      <p className="auth-switch"><a href="/login">Back to sign in</a></p>
    </form>
  </AuthPage>;
}
