import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthPage from "../components/auth/AuthPage";
import AuthField from "../components/auth/AuthField";
import { api } from "../services/api";

export default function VerifyEmailPage() {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token") || "";
  const [email, setEmail] = useState(query.get("email") || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api("/verify-email", { method: "POST", body: JSON.stringify({ token }) })
      .then((result) => setMessage(`${result.message} You can sign in now.`))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const resend = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api("/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasRegistrationEmail = Boolean(email) && !token;
  const subtitle = message
    ? "Your email address has been verified."
    : hasRegistrationEmail
      ? "Your account is almost ready."
      : "Check your inbox for a verification link from Narrate.";

  return <AuthPage eyebrow="Verify your email" title={message ? "You are all set." : hasRegistrationEmail ? "Check your email." : "One last step."} subtitle={subtitle}>
    {token && loading ? <p>Verifying your email…</p> : message ? <p className="form-success">{message} <a href="/login">Sign in</a></p> : <form className="auth-form" onSubmit={resend}>
      {hasRegistrationEmail && <p className="form-success">We sent a verification link to <strong>{email}</strong> from <strong>virasakee.dev@gmail.com</strong>. Please check your spam folder too, just in case it was filtered there.</p>}
      <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      {error && <p className="form-error">{error}</p>}
      <button className="button primary full" disabled={loading}>{loading ? "Sending…" : "Resend verification"}</button>
      <p className="auth-switch"><a href="/login">Back to sign in</a></p>
    </form>}
  </AuthPage>;
}
