"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Trash2, Plus, LogOut, Github, Save, Search, Notebook, SortAsc, SortDesc } from "lucide-react";

type SortOption = "updated_desc" | "updated_asc" | "title_asc" | "title_desc";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  login: string;
  avatar_url?: string;
}

// Memoized Note 
const NoteItem = React.memo(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete 
}: { 
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onDelete: (noteId: string) => void;
}) => (
  <div
    onClick={() => onSelect(note)}
    className={`p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/5 ${
      isSelected ? "bg-white/10 border-l-4 border-pink-500" : ""
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate">{note.title}</h3>
        <p className="text-purple-300 text-sm truncate mt-1">
          {note.content.substring(0, 50) || "No content"}
        </p>
        <p className="text-purple-400 text-xs mt-2">
          {new Date(note.updated_at).toLocaleDateString("en-GB")}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="text-purple-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/10 flex-shrink-0"
        title="Delete note"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
));

NoteItem.displayName = 'NoteItem';

const NotesApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("updated_desc");

  // Debounce 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github";
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setNotes([]);
      setSelectedNote(null);
      setTitle("");
      setContent("");
    }
  };

  const loadNotes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?userId=${user.id}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert("Failed to load notes: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveNote = async () => {
    if ((!title.trim() && !content.trim()) || !user) return;
    
    setSaving(true);

    const payload = {
      id: selectedNote?.id,
      userId: user.id,
      title: title.trim() || "Untitled",
      content: content.trim(),
    };

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Save failed");
      }

      const savedNote: Note = await res.json();

      if (!savedNote?.id) {
        throw new Error("Server returned invalid data");
      }

      if (selectedNote) {
        setNotes(notes.map((n) => (n.id === savedNote.id ? savedNote : n)));
        setSelectedNote(savedNote);
      } else {
        setNotes([savedNote, ...notes]);
        setSelectedNote(savedNote);
      }
    } catch (err) {
      console.error("saveNote() error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert("Save failed: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const createNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };

  const selectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }, []);

  const deleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    
    try {
      const res = await fetch(`/api/notes?noteId=${noteId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        throw new Error("Delete request failed");
      }
      
      setNotes(notes.filter((n) => n.id !== noteId));
      if (selectedNote?.id === noteId) {
        createNewNote();
      }
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert("Delete failed: " + errorMessage);
    }
  };

  // Memoized 
  const getSortedNotes = useMemo(() => {
    const sortableNotes = [...notes];
    sortableNotes.sort((a, b) => {
      switch (sortOption) {
        case "updated_desc":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "updated_asc":
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    return sortableNotes;
  }, [notes, sortOption]);

  // Memoized 
  const filteredNotes = useMemo(() => {
    return getSortedNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        note.content.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [getSortedNotes, debouncedSearch]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const u: User = await res.json();
          setUser(u);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Load notes
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, loadNotes]);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleString("en-GB", {
          hour12: false,
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Notebook className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">NTS</h1>
            <p className="text-purple-200 mb-1">Notes To Self</p>
            <p className="text-cyan-200 text-xs">{currentTime}</p>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Github className="w-5 h-5" />
            {loading ? "Connecting..." : "Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar - Fixed width with proper scrolling */}
      <div className="w-80 bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col h-screen">
        {/* User Info & New Note - Fixed height */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || "./avatar-192.png"}
                alt="User avatar"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <p className="text-cyan-200 text-xs">@{user.login}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-purple-300 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={createNewNote}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New
          </button>
        </div>

        {/* Search & Sort - Fixed height */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
       
          <div className="flex items-center justify-between">
            <label htmlFor="sort-select" className="text-sm text-purple-300">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="block w-full bg-white/5 border border-white/10 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:border-purple-500 appearance-none pr-8 cursor-pointer transition-colors"
              >
                <option value="updated_desc" className="bg-slate-800 text-white">
                  Latest Update
                </option>
                <option value="updated_asc" className="bg-slate-800 text-white">
                  Oldest Update
                </option>
                <option value="title_asc" className="bg-slate-800 text-white">
                  Title (A-Z)
                </option>
                <option value="title_desc" className="bg-slate-800 text-white">
                  Title (Z-A)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-300">
                {sortOption.includes("asc") ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes List - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-purple-300">Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-purple-300">
              {debouncedSearch ? "No notes found matching your search" : "No notes yet"}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNote?.id === note.id}
                onSelect={selectNote}
                onDelete={deleteNote}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor - Flexible width with proper scrolling */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Editor Header - Fixed height */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-lg flex-shrink-0">
          <div className="text-purple-200 text-sm">
            {selectedNote ? "Editing note" : "New note"}
            {selectedNote && (
              <span className="ml-4 text-purple-400 text-xs">
                Last updated: {new Date(selectedNote.updated_at).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={saveNote}
            disabled={saving || (!title.trim() && !content.trim())}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Editor Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <input
              type="text"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-purple-300/50 focus:outline-none mb-6"
            />
            <textarea
              placeholder="Note to self..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] bg-transparent border-none text-lg text-purple-100 placeholder-purple-300/50 focus:outline-none resize-none"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
