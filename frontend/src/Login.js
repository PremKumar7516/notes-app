// frontend/src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", { username, password });
      const { token, username: uname } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", uname || username);
      setMsg({ type: "success", text: "Logged in" });
      if (onLogin) onLogin(token);
      setTimeout(() => nav("/"), 500);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Login failed" });
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {msg && <div className={msg.type === "error" ? "text-red-600" : "text-green-600"}>{msg.text}</div>}
      <form onSubmit={submit} className="space-y-3 mt-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded"/>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Login</button>
      </form>
      <p className="mt-3">No account? <Link to="/register" className="text-indigo-600">Register</Link></p>
    </div>
  );
}
