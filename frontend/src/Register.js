// frontend/src/Register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/register", { username, email, password });
      setMsg({ type: "success", text: res.data.message });
      setTimeout(() => nav("/login"), 1000);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Register failed" });
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {msg && <div className={msg.type === "error" ? "text-red-600" : "text-green-600"}>{msg.text}</div>}
      <form onSubmit={submit} className="space-y-3 mt-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded"/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded"/>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Register</button>
      </form>
      <p className="mt-3">Already have account? <Link to="/login" className="text-indigo-600">Login</Link></p>
    </div>
  );
}
