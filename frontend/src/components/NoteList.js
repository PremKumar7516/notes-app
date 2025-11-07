import React from "react";

function NoteList({ notes, updateNote, deleteNote }) {
  return (
    <div>
      {notes.length === 0 ? (
        <p>No notes available</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button
              onClick={() =>
                updateNote(note.id, {
                  title: prompt("New title:", note.title) || note.title,
                  content: prompt("New content:", note.content) || note.content,
                })
              }
              style={{ marginRight: "10px" }}
            >
              Edit
            </button>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default NoteList;
