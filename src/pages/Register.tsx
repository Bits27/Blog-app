import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../lib/auth";
import { useAuth } from "../context/useAuth";

function Register() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await signUp(email, password, username);

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
        <h1 className="auth-title">Register</h1>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Create Account</button>
        </form>

        {errorMsg && <p className="notice">{errorMsg}</p>}

        <p className="auth-subtext">
          Already have an account? <Link className="auth-link" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
