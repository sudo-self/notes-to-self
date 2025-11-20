"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  Trash2, Plus, LogOut, Github, Save, Search, Notebook, 
  SortAsc, SortDesc, Edit3, Clock, User, FileText, 
  BookOpen, Zap, Moon, Sun, Menu, X, Shield, RotateCcw,
  Type, Hash, Calendar, Copy, Check, Share
} from "lucide-react";

type SortOption = "updated_desc" | "updated_asc" | "title_asc" | "title_desc";
type ViewMode = "edit" | "preview";

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

// Toast
const Toast = ({ message, type = "success", onClose }: { 
  message: string; 
  type?: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 max-w-md w-full mx-4 ${
      type === "success" 
        ? "bg-green-500/90 text-white border-green-400" 
        : "bg-red-500/90 text-white border-red-400"
    }`}>
      <div className="flex items-center gap-2">
        {type === "success" ? (
          <Check className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Enhanced Note 
const EnhancedNoteItem = React.memo(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete,
  onCopy,
  onShare
}: { 
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onCopy: (note: Note) => void;
  onShare: (note: Note) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle");
  const [shareState, setShareState] = useState<"idle" | "sharing" | "shared">("idle");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-GB", { weekday: 'short' });
    } else {
      return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyState("copying");
    
    try {
      await onCopy(note);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1000);
    } catch (error) {
      setCopyState("idle");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareState("sharing");
    
    try {
      await onShare(note);
      setShareState("shared");
      setTimeout(() => setShareState("idle"), 1000);
    } catch (error) {
      setShareState("idle");
    }
  };

  return (
    <div
      onClick={() => onSelect(note)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all duration-300 group ${
        isSelected 
          ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-l-4 border-blue-400 shadow-inner" 
          : "hover:bg-gray-700/20 hover:border-l-4 hover:border-gray-500/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-semibold truncate text-base">
              {note.title || "Untitled Note"}
            </h3>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2 mb-3 leading-relaxed">
            {note.content.substring(0, 100) || "No content yet..."}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(note.updated_at)}</span>
            </div>
            {note.content.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <Type className="w-3 h-3" />
                <span>{note.content.length} chars</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className={`text-gray-400 hover:text-green-400 transition-all duration-300 p-2 rounded-lg ${
              (isHovered || isSelected || shareState !== "idle") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } hover:bg-gray-600/50 transform hover:scale-110`}
            title="Share note"
            disabled={shareState === "sharing"}
          >
            {shareState === "shared" ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : shareState === "sharing" ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Share className="w-4 h-4" />
            )}
          </button>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`text-gray-400 hover:text-blue-400 transition-all duration-300 p-2 rounded-lg ${
              (isHovered || isSelected || copyState !== "idle") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } hover:bg-gray-600/50 transform hover:scale-110`}
            title="Copy note content"
            disabled={copyState === "copying"}
          >
            {copyState === "copied" ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : copyState === "copying" ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className={`text-gray-400 hover:text-red-400 transition-all duration-300 p-2 rounded-lg ${
              (isHovered || isSelected) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } hover:bg-gray-600/50 transform hover:scale-110`}
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

EnhancedNoteItem.displayName = 'EnhancedNoteItem';

// Loading Skeleton
const NoteSkeleton = () => (
  <div className="p-4 border-b border-gray-700/50 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-600/30 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-600/30 rounded w-3/4"></div>
        <div className="h-3 bg-gray-600/30 rounded w-full"></div>
        <div className="h-3 bg-gray-600/30 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Stats Panel
const StatsPanel = ({ notes, characterCount }: { notes: Note[], characterCount: number }) => (
  <div className="flex items-center gap-4 text-xs text-gray-400">
    <div className="flex items-center gap-1">
      <BookOpen className="w-3 h-3" />
      <span>{notes.length} notes</span>
    </div>
    <div className="flex items-center gap-1">
      <Type className="w-3 h-3" />
      <span>{characterCount} chars</span>
    </div>
  </div>
);

// Confirmation Dialog
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Yes Forever
          </button>
        </div>
      </div>
    </div>
  );
};

const EnhancedNotesApp = () => {
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
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [characterCount, setCharacterCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // prevent infinite loops
  const autoSaveInProgress = useRef(false);
  const lastSavedContent = useRef({ title: "", content: "" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmationDialog(null);
      }
    });
  };

  const closeConfirmation = () => {
    setConfirmationDialog(null);
  };

  const copyNoteToClipboard = async (note: Note) => {
    try {
      const textToCopy = note.title ? `${note.title}\n\n${note.content}` : note.content;
      await navigator.clipboard.writeText(textToCopy);
      showToast("Note copied to clipboard!");
      return true;
    } catch (error) {
      console.error("Failed to copy note:", error);
      showToast("Failed to copy note", "error");
      return false;
    }
  };

  const shareNote = async (note: Note) => {
    try {
      const textToShare = note.title ? `${note.title}\n\n${note.content}` : note.content;
      
      // Web Share API 
      if (navigator.share) {
        await navigator.share({
          title: note.title || 'Note from NTS',
          text: textToShare,
          url: window.location.href,
        });
        showToast("Note shared!");
      } else {
        // Fallback to clipboard 
        await navigator.clipboard.writeText(textToShare);
        showToast("Note copied to clipboard (share not available)");
      }
      return true;
    } catch (error) {
      // User cancelled 
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Failed to share note:", error);
        showToast("Failed to share note", "error");
      }
      return false;
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Character count 
  useEffect(() => {
    setCharacterCount(content.length);
    
    const isChanged = selectedNote 
      ? title !== selectedNote.title || content !== selectedNote.content
      : title.trim() !== "" || content.trim() !== "";
    
    setHasUnsavedChanges(isChanged);
  }, [title, content, selectedNote]);

  // Auto-save 
  useEffect(() => {
    if (autoSave && 
        hasUnsavedChanges && 
        user && 
        (title.trim() || content.trim()) &&
        !saving &&
        !autoSaveInProgress.current &&
        (title !== lastSavedContent.current.title || content !== lastSavedContent.current.content)
    ) {
      autoSaveInProgress.current = true;
      
      const autoSaveTimer = setTimeout(() => {
        if (!saving) {
          saveNote();
        }
      }, 2000); // prevent
      
      return () => {
        clearTimeout(autoSaveTimer);
        autoSaveInProgress.current = false;
      };
    }
  }, [title, content, autoSave, hasUnsavedChanges, saving, user]);

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
      lastSavedContent.current = { title: "", content: "" };
    }
  };

  const loadNotes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
      showToast("Failed to load notes", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveNote = async () => {
    if ((!title.trim() && !content.trim()) || !user || !hasUnsavedChanges) return;
    
    // Prevent multiple 
    if (title === lastSavedContent.current.title && content === lastSavedContent.current.content) {
      return;
    }
    
    setSaving(true);
    const payload = {
      id: selectedNote?.id,
      userId: user.id,
      title: title.trim() || "Untitled Note",
      content: content.trim(),
    };

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      const savedNote: Note = await res.json();

      if (selectedNote) {
        setNotes(notes.map((n) => (n.id === savedNote.id ? savedNote : n)));
        setSelectedNote(savedNote);
      } else {
        setNotes([savedNote, ...notes]);
        setSelectedNote(savedNote);
      }
      
      // Update
      lastSavedContent.current = { title, content };
      setHasUnsavedChanges(false);
      showToast("Note saved!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save note", "error");
    } finally {
      setSaving(false);
      autoSaveInProgress.current = false;
    }
  };

  const createNewNote = () => {
    if (hasUnsavedChanges) {
      showConfirmation(
        "Unsaved Changes",
        "You have unsaved changes. Create new note anyway?",
        () => {
          setSelectedNote(null);
          setTitle("");
          setContent("");
          setHasUnsavedChanges(false);
          lastSavedContent.current = { title: "", content: "" };
        }
      );
    } else {
      setSelectedNote(null);
      setTitle("");
      setContent("");
      setHasUnsavedChanges(false);
      lastSavedContent.current = { title: "", content: "" };
    }
  };

  const selectNote = useCallback((note: Note) => {
    if (hasUnsavedChanges) {
      showConfirmation(
        "Unsaved Changes",
        "You have unsaved changes. Switch note anyway?",
        () => {
          setSelectedNote(note);
          setTitle(note.title);
          setContent(note.content);
          setHasUnsavedChanges(false);
          lastSavedContent.current = { title: note.title, content: note.content };
        }
      );
    } else {
      setSelectedNote(note);
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
      lastSavedContent.current = { title: note.title, content: note.content };
    }
  }, [hasUnsavedChanges]);

  const deleteNote = async (noteId: string) => {
    showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`/api/notes?noteId=${noteId}`, { 
            method: "DELETE" 
          });
          
          if (!res.ok) throw new Error("Delete request failed");
          
          setNotes(notes.filter((n) => n.id !== noteId));
          if (selectedNote?.id === noteId) {
            setSelectedNote(null);
            setTitle("");
            setContent("");
            setHasUnsavedChanges(false);
            lastSavedContent.current = { title: "", content: "" };
          }
          showToast("Note deleted");
        } catch (err) {
          console.error("Delete error:", err);
          showToast("Failed to delete note", "error");
        }
      }
    );
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

  // loading
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

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, loadNotes]);

  // clock
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Notebook className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">NTS</h1>
            <p className="text-blue-200 mb-2">Notes To Self</p>
            <p className="text-cyan-200 text-xs font-mono">{currentTime}</p>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-gray-600"
          >
            <Github className="w-5 h-5" />
            {loading ? "Connecting..." : "Sign in"}
          </button>
          <div className="mt-6 text-center text-gray-400 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>All notes are private and secure</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Notebook className="w-4 h-4" />
              <span>NTS does not access your account</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={closeConfirmation}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800/90 backdrop-blur-sm text-white p-2 rounded-lg border border-gray-600"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        w-80 bg-gray-800/80 backdrop-blur-lg border-r border-gray-700/50 flex flex-col h-screen transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40
      `}>
        {/* User Info & New Note */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || "./avatar-192.png"}
                alt="User avatar"
                className="w-10 h-10 rounded-lg object-cover border-2 border-blue-400/50"
              />
              <div>
                <p className="text-white text-sm font-medium">@{user.login}</p>
                <StatsPanel notes={notes} characterCount={characterCount} />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={createNewNote}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              New Note
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
       
          <div className="flex items-center justify-between">
            <label htmlFor="sort-select" className="text-sm text-gray-400">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="block w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer transition-colors"
              >
                <option value="updated_desc" className="bg-gray-800 text-white">
                  Latest Update
                </option>
                <option value="updated_asc" className="bg-gray-800 text-white">
                  Oldest Update
                </option>
                <option value="title_asc" className="bg-gray-800 text-white">
                  Title (A-Z)
                </option>
                <option value="title_desc" className="bg-gray-800 text-white">
                  Title (Z-A)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                {sortOption.includes("asc") ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <NoteSkeleton key={i} />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {debouncedSearch ? "No notes found" : "No notes yet"}
              </p>
              <p className="text-sm">
                {debouncedSearch ? "Try adjusting your search" : "Create your first note to get started"}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <EnhancedNoteItem
                key={note.id}
                note={note}
                isSelected={selectedNote?.id === note.id}
                onSelect={selectNote}
                onDelete={deleteNote}
                onCopy={copyNoteToClipboard}
                onShare={shareNote}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Editor Header */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/50 backdrop-blur-lg flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-gray-300 text-sm">
              {selectedNote ? (
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Editing note</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-xs">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(selectedNote.updated_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>New note</span>
                </div>
              )}
            </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <Zap className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <StatsPanel notes={[selectedNote].filter(Boolean) as Note[]} characterCount={characterCount} />
            
            <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`p-1 rounded text-xs ${autoSave ? 'text-green-400' : 'text-gray-400'}`}
                title={autoSave ? "Auto-save enabled" : "Auto-save disabled"}
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={saveNote}
              disabled={saving || !hasUnsavedChanges}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              {saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-gray-900/30">
          <div className="max-w-4xl mx-auto p-6">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-gray-400 focus:outline-none mb-6 font-serif"
            />
            <textarea
              placeholder="Note to self..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[60vh] bg-transparent border-none text-lg text-gray-100 placeholder-gray-500 focus:outline-none resize-none leading-relaxed font-light"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotesApp;
