import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPage from "../components/auth/AuthPage";
import AuthField from "../components/auth/AuthField";
import { api } from "../services/api";
import Icon from "../components/common/Icon";

export default function LoginPage({ onLogin }) {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [e, setE] = useState("");
  const [l, setL] = useState(false);

  const getFriendlyError = (message) => {
    if (!message) return "Unable to sign in right now. Please try again.";
    const normalized = message.toLowerCase();
    if (normalized.includes("verify your email")) {
      return "Please verify your email before signing in.";
    }
    if (normalized.includes("invalid username or password") || normalized.includes("username") || normalized.includes("password")) {
      return "Incorrect username or password. Please try again.";
    }
    return message;
  };

  const submit = async (event) => {
    event.preventDefault();
    setL(true);
    setE("");

    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify({ username: u, password: p }),
      });
      onLogin(data);
      nav("/");
    } catch (err) {
      const message = getFriendlyError(err.message);
      if (message.toLowerCase().includes("verify your email")) {
        nav(`/verify-email?email=${encodeURIComponent(u)}`, { replace: true });
        return;
      }
      setE(message);
    } finally {
      setL(false);
    }
  };

  return (
    <AuthPage eyebrow="Welcome back" title="Continue reading." subtitle="Your library and drafts are waiting.">
      <form className="auth-form" onSubmit={submit}>
        <AuthField label="Username" value={u} onChange={setU} autoComplete="username" />
        <AuthField label="Password" type="password" value={p} onChange={setP} autoComplete="current-password" />
        <p className="auth-switch"><a href="/forgot-password">Forgot your password?</a></p>
        {e && <p className="form-error">{e}</p>}
        <button className="button primary full" disabled={l}>{l ? "Signing in…" : "Sign in"}<Icon name="arrow" /></button>
        <p className="auth-switch">New here? <a href="/register">Create an account</a></p>
      </form>
    </AuthPage>
  );
}
