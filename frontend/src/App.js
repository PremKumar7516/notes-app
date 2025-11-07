// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import api from "./api";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState({ username: localStorage.getItem("username") });

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setDarkMode(savedTheme === "dark");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Fetch notes when token changes
  useEffect(() => {
    if (!token) return;
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data);
        setUser({ username: localStorage.getItem("username") });
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [token]);

  const addNote = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      const res = await api.post(
        "/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, { id: res.data.id, title, content }]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setNotes([]);
    setUser(null);
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login onLogin={setToken} />} />
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">📝 Notes App</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome,{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {user?.username}
            </span>
            !
          </p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border dark:bg-gray-800 dark:text-gray-100 rounded-lg p-3 mb-3"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border dark:bg-gray-800 dark:text-gray-100 rounded-lg p-3"
            ></textarea>
            <button
              onClick={addNote}
              className="mt-3 w-full bg-indigo-500 text-white py-2 rounded-lg font-semibold hover:bg-indigo-600"
            >
              Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No notes yet. Start writing something!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-indigo-50 dark:bg-gray-800 border rounded-xl p-4 shadow relative"
                >
                  <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                    {note.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
