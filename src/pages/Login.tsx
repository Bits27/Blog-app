import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    navigate("/");
  };

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [loading, user, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">Inkframe</div>
        <h1 className="auth-title">Login</h1>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        {errorMsg && <p className="notice">{errorMsg}</p>}

        <p className="auth-subtext">
          No account? <Link className="auth-link" to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
