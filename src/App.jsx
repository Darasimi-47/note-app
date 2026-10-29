
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const starterNotes = [
  {
    id: 1,
    title: "Welcome to Daynote ✨",
    content:
      "# Welcome to Daynote!\n\nYour thoughts deserve a home.\n\n- Create your first note\n- Organise your thoughts with tags\n- Search your notes anytime\n\n**Everything is saved automatically.**",
    tag: "Personal",
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "My goals",
    content:
      "## Things I want to achieve\n\n1. Learn something new every day\n2. Stay organised\n3. Make time for myself",
    tag: "Goals",
    updatedAt: new Date().toISOString(),
  },
];

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("daynote-notes");
      return saved ? JSON.parse(saved) : starterNotes;
    } catch {
      return starterNotes;
    }
  });

  const [activeId, setActiveId] = useState(notes[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All notes");
  const [preview, setPreview] = useState(false);
  const [showMobileNotes, setShowMobileNotes] = useState(false);

  useEffect(() => {
    localStorage.setItem("daynote-notes", JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((note) => note.id === activeId);

  const tags = useMemo(
    () => ["All notes", ...new Set(notes.map((note) => note.tag).filter(Boolean))],
    [notes]
  );

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === "All notes" || note.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  function updateNote(field, value) {
    setNotes((current) =>
      current.map((note) =>
        note.id === activeId
          ? { ...note, [field]: value, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }

  function createNote() {
    const newNote = {
      id: Date.now(),
      title: "Untitled note",
      content: "",
      tag: "Personal",
      updatedAt: new Date().toISOString(),
    };

    setNotes((current) => [newNote, ...current]);
    setActiveId(newNote.id);
    setSelectedTag("All notes");
    setPreview(false);
    setShowMobileNotes(false);
  }

  function deleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const remaining = notes.filter((note) => note.id !== id);
    setNotes(remaining);
    setActiveId(remaining[0]?.id ?? null);
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMobileNotes ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">D</div>
          <span>daynote</span>
        </div>

        <button className="new-note-button" onClick={createNote}>
          <span>＋</span> New note
        </button>

        <div className="sidebar-heading">YOUR SPACE</div>

        <button
          className={`nav-item ${selectedTag === "All notes" ? "selected" : ""}`}
          onClick={() => setSelectedTag("All notes")}
        >
          <span>▤</span> All notes
          <span className="nav-count">{notes.length}</span>
        </button>

        <div className="sidebar-heading tag-heading">YOUR TAGS</div>

        {tags.filter((tag) => tag !== "All notes").map((tag) => (
          <button
            key={tag}
            className={`nav-item ${selectedTag === tag ? "selected" : ""}`}
            onClick={() => setSelectedTag(tag)}
          >
            <span className="tag-dot">●</span> {tag}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile-circle">D</div>
          <div>
            <strong>My workspace</strong>
            <small>Your personal space</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setShowMobileNotes(!showMobileNotes)}
          >
            ☰
          </button>
          <div className="breadcrumb">My workspace <span>/</span> Notes</div>
          <div className="topbar-right">
            <span className="save-status">● Saved locally</span>
          </div>
        </header>

        <div className="workspace">
          <section className={`notes-panel ${showMobileNotes ? "hide-mobile" : ""}`}>
            <div className="panel-title">
              <div>
                <p className="eyebrow">YOUR THOUGHTS, ORGANised</p>
                <h1>My notes<span>.</span></h1>
                <p className="muted">{notes.length} notes in your workspace</p>
              </div>
              <button className="add-button" onClick={createNote}>＋</button>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your notes..."
              />
              <kbd>⌘ K</kbd>
            </div>

            <div className="note-list">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  className={`note-card ${activeId === note.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveId(note.id);
                    setShowMobileNotes(false);
                  }}
                >
                  <div className="note-card-top">
                    <span className="note-tag">{note.tag}</span>
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                  </div>
                  <h3>{note.title || "Untitled note"}</h3>
                  <p>{note.content.replace(/[#*`>-]/g, "").slice(0, 90) || "No content yet..."}</p>
                </button>
              ))}

              {filteredNotes.length === 0 && (
                <div className="empty-list">
                  <span>⌕</span>
                  <p>No notes found.</p>
                  <small>Try another search or create a note.</small>
                </div>
              )}
            </div>
          </section>

          <section className="editor-panel">
            {activeNote ? (
              <>
                <div className="editor-toolbar">
                  <div className="editor-date">
                    Last edited {formatDate(activeNote.updatedAt)}
                  </div>
                  <div className="toolbar-actions">
                    <button
                      className={`preview-button ${preview ? "active-preview" : ""}`}
                      onClick={() => setPreview(!preview)}
                    >
                      {preview ? "✎ Edit" : "◉ Preview"}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteNote(activeId)}
                      title="Delete note"
                    >
                      ♲
                    </button>
                  </div>
                </div>

                <div className="editor-content">
                  {preview ? (
                    <div className="markdown-preview">
                      <h1>{activeNote.title || "Untitled note"}</h1>
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <>
                      <input
                        className="note-title-input"
                        value={activeNote.title}
                        onChange={(event) => updateNote("title", event.target.value)}
                        placeholder="Give your note a title..."
                      />
                      <div className="editor-meta">
                        <select
                          value={activeNote.tag}
                          onChange={(event) => updateNote("tag", event.target.value)}
                        >
                          <option>Personal</option>
                          <option>Work</option>
                          <option>Ideas</option>
                          <option>Goals</option>
                          <option>Study</option>
                        </select>
                        <span>Markdown supported</span>
                      </div>
                      <textarea
                        className="note-content-input"
                        value={activeNote.content}
                        onChange={(event) => updateNote("content", event.target.value)}
                        placeholder="Start writing your thoughts here..."
                      />
                    </>
                  )}
                </div>

                <div className="editor-footer">
                  <span>✦ A little space for your thoughts.</span>
                  <span>{activeNote.content.length} characters</span>
                </div>
              </>
            ) : (
              <div className="empty-editor">
                <div className="empty-icon">✎</div>
                <h2>Your space, your thoughts.</h2>
                <p>Create a note and let your ideas flow.</p>
                <button className="new-note-button" onClick={createNote}>
                  ＋ Create your first note
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
