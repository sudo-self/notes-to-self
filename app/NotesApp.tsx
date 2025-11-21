"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  Trash2, Plus, LogOut, Github, Save, Search, Notebook, 
  SortAsc, SortDesc, Edit3, Clock, User, FileText, 
  BookOpen, Zap, Moon, Sun, Menu, X, Shield, RotateCcw,
  Type, Hash, Calendar, Copy, Check, Share, Tag, Archive, 
  ArchiveRestore, Star, AlertCircle, Eye, EyeOff, Code,
  Lock, Unlock, MoreVertical, Download, Upload, Maximize2,
  Filter, List, Grid, Settings
} from "lucide-react";

type SortOption = "updated_desc" | "updated_asc" | "title_asc" | "title_desc";
type ViewMode = "edit" | "preview" | "split";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  archived?: boolean;
  pinned?: boolean;
  isPrivate?: boolean;
  color?: string;
}

interface User {
  id: string;
  login: string;
  avatar_url?: string;
}

// Toast Component
const Toast = ({ message, type = "success", onClose }: { 
  message: string; 
  type?: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500/90" : type === "error" ? "bg-red-500/90" : "bg-blue-500/90";
  const borderColor = type === "success" ? "border-green-400" : type === "error" ? "border-red-400" : "border-blue-400";

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 max-w-md w-full mx-4 text-white ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-2">
        {type === "success" ? <Check className="w-4 h-4" /> : type === "error" ? <X className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Markdown Preview Component
const MarkdownPreview = ({ content, isDark }: { content: string; isDark: boolean }) => {
  const parseMarkdown = (text: string) => {
    return text
      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-300/30 px-2 py-1 rounded font-mono text-sm">$1</code>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`prose prose-invert max-w-none p-6 overflow-auto h-full ${
      isDark ? 'text-gray-100' : 'text-gray-800'
    }`}>
      <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) || '<p class="text-gray-400">Start writing to see preview...</p>' }} />
    </div>
  );
};

// Tag Manager Component
const TagManager = ({ tags, onTagsChange, isDark }: { 
  tags: string[]; 
  onTagsChange: (tags: string[]) => void;
  isDark: boolean;
}) => {
  const [input, setInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      if (!tags.includes(input.trim())) {
        onTagsChange([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  return (
    <div className={`p-4 border rounded-lg space-y-3 ${
      isDark ? "border-gray-700/50 bg-gray-800/30" : "border-gray-300/50 bg-gray-100/30"
    }`}>
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4" />
        <label className="text-sm font-medium">Tags</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isDark ? "bg-blue-600/30 text-blue-200" : "bg-blue-200/50 text-blue-700"
          }`}>
            <span>{tag}</span>
            <button onClick={() => onTagsChange(tags.filter(t => t !== tag))} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add tag and press Enter..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleAddTag}
        className={`w-full px-3 py-2 rounded border focus:outline-none text-sm ${
          isDark 
            ? "bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400" 
            : "bg-gray-100/50 border-gray-300/50 text-gray-800 placeholder-gray-500"
        }`}
      />
    </div>
  );
};

// Word Count & Reading Time Component
const ReadingStats = ({ content, isDark }: { content: string; isDark: boolean }) => {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  return (
    <div className={`flex gap-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
      <div className="flex items-center gap-1">
        <Hash className="w-3 h-3" />
        <span>{wordCount} words</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
};

// Note Options Menu
const NoteOptionsMenu = ({ note, onPin, onArchive, onTogglePrivate, onExport, isDark }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? "hover:bg-gray-700/50 text-gray-400" : "hover:bg-gray-200/50 text-gray-500"
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {open && (
        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
        }`}>
          <button onClick={() => { onPin(); setOpen(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-50 border-b ${
            isDark ? "text-gray-300 hover:bg-gray-700 border-gray-700" : "text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}>
            <Star className="w-4 h-4" />
            {note.pinned ? "Unpin" : "Pin note"}
          </button>
          <button onClick={() => { onArchive(); setOpen(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-50 border-b ${
            isDark ? "text-gray-300 hover:bg-gray-700 border-gray-700" : "text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}>
            {note.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {note.archived ? "Unarchive" : "Archive"}
          </button>
          <button onClick={() => { onTogglePrivate(); setOpen(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-50 border-b ${
            isDark ? "text-gray-300 hover:bg-gray-700 border-gray-700" : "text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}>
            {note.isPrivate ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {note.isPrivate ? "Make public" : "Make private"}
          </button>
          <button onClick={() => { onExport(); setOpen(false); }} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-opacity-50 ${
            isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
          }`}>
            <Download className="w-4 h-4" />
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Note Item
const EnhancedNoteItem = React.memo(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete,
  onCopy,
  isDark,
  onPin,
  onArchive,
  onTogglePrivate,
  onExport
}: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
    else if (diffDays === 1) return "Yesterday";
    else if (diffDays < 7) return date.toLocaleDateString("en-GB", { weekday: 'short' });
    else return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
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

  return (
    <div
      onClick={() => onSelect(note)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-4 border-b cursor-pointer transition-all duration-300 group relative ${
        isDark ? "border-gray-700/50" : "border-gray-300/50"
      } ${
        isSelected 
          ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-l-4 border-blue-400 shadow-inner" 
          : `hover:border-l-4 ${isDark ? "hover:bg-gray-700/20 hover:border-gray-500/50" : "hover:bg-gray-100/80 hover:border-gray-400/50"}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {note.pinned && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
            {note.isPrivate && <Lock className="w-3 h-3 text-gray-400" />}
            <FileText className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <h3 className={`font-semibold truncate text-base ${isDark ? "text-white" : "text-gray-800"}`}>
              {note.title || "Untitled Note"}
            </h3>
          </div>
          <p className={`text-sm line-clamp-2 mb-2 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {note.content.substring(0, 100) || "No content yet..."}
          </p>
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isDark ? "bg-blue-600/30 text-blue-300" : "bg-blue-200/50 text-blue-700"
                }`}>
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className={`text-xs px-2 py-0.5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 text-xs">
            <div className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <Clock className="w-3 h-3" />
              <span>{formatDate(note.updated_at)}</span>
            </div>
            {note.content.length > 0 && (
              <div className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Type className="w-3 h-3" />
                <span>{note.content.length} chars</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`transition-all duration-300 p-2 rounded-lg ${
              (isHovered || isSelected || copyState !== "idle") ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${isDark ? "text-gray-400 hover:text-blue-400 hover:bg-gray-600/50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-200/50"} transform hover:scale-110`}
            title="Copy note content"
          >
            {copyState === "copied" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <NoteOptionsMenu 
            note={note} 
            onPin={() => onPin(note)} 
            onArchive={() => onArchive(note)}
            onTogglePrivate={() => onTogglePrivate(note)}
            onExport={() => onExport(note)}
            isDark={isDark}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className={`transition-all duration-300 p-2 rounded-lg opacity-0 group-hover:opacity-100 ${
              isDark ? "text-gray-400 hover:text-red-400 hover:bg-gray-600/50" : "text-gray-500 hover:text-red-600 hover:bg-gray-200/50"
            } transform hover:scale-110`}
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
const NoteSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`p-4 border-b animate-pulse ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
      <div className="flex-1 space-y-2">
        <div className={`h-4 rounded w-3/4 ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
        <div className={`h-3 rounded w-full ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
        <div className={`h-3 rounded w-2/3 ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
      </div>
    </div>
  </div>
);

// Confirmation Dialog
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, isDark }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`backdrop-blur-lg border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
        isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-300"
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>{title}</h3>
        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className={`px-4 py-2 transition-colors rounded ${isDark ? "text-gray-300 hover:text-white hover:bg-gray-700/50" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Theme Toggle
const ThemeToggle = ({ isDark, setIsDark }: any) => (
  <button
    onClick={() => setIsDark(!isDark)}
    className={`p-2 rounded-lg transition-all duration-300 group ${
      isDark ? "text-gray-400 hover:text-amber-400 hover:bg-gray-700/50" : "text-gray-500 hover:text-amber-600 hover:bg-gray-200/50"
    }`}
    title={`Switch to ${isDark ? "light" : "dark"} mode`}
  >
    {isDark ? <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
  </button>
);

const EnhancedNotesApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("updated_desc");
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [characterCount, setCharacterCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<any>(null);
  const [isDark, setIsDark] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const autoSaveInProgress = useRef(false);
  const lastSavedContent = useRef({ title: "", content: "", tags: [] });

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(savedTheme ? savedTheme === "dark" : systemPrefersDark);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
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

  const copyNoteToClipboard = async (note: Note) => {
    const textToCopy = note.title ? `${note.title}\n\n${note.content}` : note.content;
    await navigator.clipboard.writeText(textToCopy);
    showToast("Note copied to clipboard!");
    return true;
  };

  const exportNoteAsJSON = (note: Note) => {
    const dataStr = JSON.stringify(note, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'note'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Note exported as JSON!");
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Character count and change detection
  useEffect(() => {
    setCharacterCount(content.length);
    const isChanged = selectedNote 
      ? title !== selectedNote.title || content !== selectedNote.content || JSON.stringify(tags) !== JSON.stringify(selectedNote.tags || [])
      : title.trim() !== "" || content.trim() !== "" || tags.length > 0;
    setHasUnsavedChanges(isChanged);
  }, [title, content, tags, selectedNote]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && user && (title.trim() || content.trim()) && !saving && !autoSaveInProgress.current) {
      autoSaveInProgress.current = true;
      const timer = setTimeout(() => {
        if (!saving) saveNote();
      }, 2000);
      return () => {
        clearTimeout(timer);
        autoSaveInProgress.current = false;
      };
    }
  }, [title, content, autoSave, hasUnsavedChanges, saving, user, tags]);

  // Load user and notes
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

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, loadNotes]);

  const saveNote = async () => {
    if ((!title.trim() && !content.trim()) || !user || !hasUnsavedChanges) return;
    setSaving(true);
    const payload = {
      id: selectedNote?.id,
      userId: user.id,
      title: title.trim() || "Untitled Note",
      content: content.trim(),
      tags,
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
      
      lastSavedContent.current = { title, content, tags };
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
          setTags([]);
          setHasUnsavedChanges(false);
        }
      );
    } else {
      setSelectedNote(null);
      setTitle("");
      setContent("");
      setTags([]);
      setHasUnsavedChanges(false);
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
          setTags(note.tags || []);
          setHasUnsavedChanges(false);
        }
      );
    } else {
      setSelectedNote(note);
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setHasUnsavedChanges(false);
    }
  }, [hasUnsavedChanges]);

  const deleteNote = async (noteId: string) => {
    showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`/api/notes?noteId=${noteId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete request failed");
          setNotes(notes.filter((n) => n.id !== noteId));
          if (selectedNote?.id === noteId) {
            setSelectedNote(null);
            setTitle("");
            setContent("");
            setTags([]);
          }
          showToast("Note deleted");
        } catch (err) {
          console.error("Delete error:", err);
          showToast("Failed to delete note", "error");
        }
      }
    );
  };

  const togglePin = (note: Note) => {
    const updated = { ...note, pinned: !note.pinned };
    setNotes(notes.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
    showToast(updated.pinned ? "Note pinned!" : "Note unpinned!");
  };

  const toggleArchive = (note: Note) => {
    const updated = { ...note, archived: !note.archived };
    setNotes(notes.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
    showToast(updated.archived ? "Note archived!" : "Note unarchived!");
  };

  const togglePrivate = (note: Note) => {
    const updated = { ...note, isPrivate: !note.isPrivate };
    setNotes(notes.map(n => n.id === note.id ? updated : n));
    if (selectedNote?.id === note.id) setSelectedNote(updated);
    showToast(updated.isPrivate ? "Note is now private!" : "Note is now public!");
  };

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
      setTags([]);
    }
  };

  // Memoized sorted and filtered notes
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

  const filteredNotes = useMemo(() => {
    return getSortedNotes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           note.content.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesArchive = showArchived ? note.archived : !note.archived;
      const matchesTag = filterTag ? note.tags?.includes(filterTag) : true;
      return matchesSearch && matchesArchive && matchesTag;
    });
  }, [getSortedNotes, debouncedSearch, showArchived, filterTag]);

  const getAllTags = useMemo(() => {
    const allTags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [notes]);

  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const archivedNotes = notes.filter(n => n.archived).length;
    const pinnedNotes = notes.filter(n => n.pinned).length;
    const privateNotes = notes.filter(n => n.isPrivate).length;
    const totalCharacters = notes.reduce((sum, note) => sum + note.content.length, 0);
    
    return { totalNotes, archivedNotes, pinnedNotes, privateNotes, totalCharacters };
  }, [notes]);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark 
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" 
          : "bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100"
      }`}>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
        
        <div className={`backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border shadow-2xl transition-colors duration-300 ${
          isDark
            ? "bg-white/10 border-white/20"
            : "bg-white/80 border-gray-200/50"
        }`}>
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                : "bg-gradient-to-br from-blue-400 to-purple-500"
            }`}>
              <Notebook className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-800"
            }`}>NTS</h1>
            <p className={`mb-2 transition-colors duration-300 ${
              isDark ? "text-blue-200" : "text-blue-600"
            }`}>Notes To Self</p>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className={`w-full font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-400"
            }`}
          >
            <Github className="w-5 h-5" />
            {loading ? "Connecting..." : "Sign in with GitHub"}
          </button>
          <div className={`mt-6 text-center text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>All notes are private and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" 
        : "bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100"
    }`}>
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
          onClose={() => setConfirmationDialog(null)}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          isDark={isDark}
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 backdrop-blur-sm p-2 rounded-lg border transition-colors duration-300 ${
          isDark
            ? "bg-gray-800/90 text-white border-gray-600"
            : "bg-white/90 text-gray-800 border-gray-300"
        }`}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        w-80 backdrop-blur-lg border-r flex flex-col h-screen transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40
        ${isDark 
          ? "bg-gray-800/80 border-gray-700/50" 
          : "bg-white/80 border-gray-300/50"
        }
      `}>
        {/* User Info & New Note */}
        <div className={`p-4 border-b flex-shrink-0 ${
          isDark ? "border-gray-700/50" : "border-gray-300/50"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || "./avatar-192.png"}
                alt="User avatar"
                className="w-10 h-10 rounded-lg object-cover border-2 border-blue-400/50"
              />
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                  @{user.login}
                </p>
                <div className={`flex gap-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  <span>{stats.totalNotes} notes</span>
                  <span>{stats.totalCharacters} chars</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
              <button
                onClick={handleLogout}
                className={`transition-colors p-2 rounded-lg ${
                  isDark 
                    ? "text-gray-400 hover:text-white hover:bg-gray-700/50" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                }`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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

        {/* Search & Filters */}
        <div className={`p-4 border-b flex-shrink-0 space-y-3 ${
          isDark ? "border-gray-700/50" : "border-gray-300/50"
        }`}>
          <div className="relative">
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-lg py-2 pl-10 pr-4 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors ${
                isDark
                  ? "bg-gray-700/50 border-gray-600/50 text-white"
                  : "bg-gray-100/50 border-gray-300/50 text-gray-800"
              }`}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                showArchived
                  ? "bg-blue-500 text-white"
                  : isDark
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
              }`}
            >
              {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              {showArchived ? "Archived" : "Active"}
            </button>
            
            <div className="relative flex-1">
              <select
                value={filterTag || ""}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className={`w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer transition-colors ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600/50 text-white"
                    : "bg-gray-200/50 border-gray-300/50 text-gray-800"
                }`}
              >
                <option value="">All tags</option>
                {getAllTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Sort by:
            </label>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className={`block border rounded-lg py-1 px-3 text-sm focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600/50 text-white"
                    : "bg-gray-100/50 border-gray-300/50 text-gray-800"
                }`}
              >
                <option value="updated_desc">Latest Update</option>
                <option value="updated_asc">Oldest Update</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                {sortOption.includes("asc") ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <NoteSkeleton key={i} isDark={isDark} />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className={`p-8 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {debouncedSearch || filterTag || showArchived ? "No notes found" : "No notes yet"}
              </p>
              <p className="text-sm">
                {debouncedSearch || filterTag || showArchived ? "Try adjusting your filters" : "Create your first note to get started"}
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
                onPin={togglePin}
                onArchive={toggleArchive}
                onTogglePrivate={togglePrivate}
                onExport={exportNoteAsJSON}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Editor Header */}
        <div className={`p-6 border-b flex items-center justify-between backdrop-blur-lg flex-shrink-0 ${
          isDark 
            ? "border-gray-700/50 bg-gray-800/50" 
            : "border-gray-300/50 bg-white/50"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              {selectedNote ? (
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Editing note</span>
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>•</span>
                  <span className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {selectedNote.updated_at ? new Date(selectedNote.updated_at).toLocaleDateString("en-GB") : 'New'}
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
              <div className={`flex items-center gap-1 text-xs ${
                isDark ? "text-amber-400" : "text-amber-600"
              }`}>
                <Zap className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <ReadingStats content={content} isDark={isDark} />
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-lg p-1 ${
                isDark ? "bg-gray-700/50" : "bg-gray-200/50"
              }`}>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`p-1 rounded text-xs ${
                    autoSave 
                      ? isDark ? 'text-green-400' : 'text-green-600' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  title={autoSave ? "Auto-save enabled" : "Auto-save disabled"}
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              <div className={`flex items-center gap-1 rounded-lg p-1 ${
                isDark ? "bg-gray-700/50" : "bg-gray-200/50"
              }`}>
                <button
                  onClick={() => setViewMode("edit")}
                  className={`p-1 rounded text-xs ${
                    viewMode === "edit" 
                      ? isDark ? 'text-blue-400' : 'text-blue-600' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  title="Edit mode"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`p-1 rounded text-xs ${
                    viewMode === "preview" 
                      ? isDark ? 'text-blue-400' : 'text-blue-600' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  title="Preview mode"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`p-1 rounded text-xs ${
                    viewMode === "split" 
                      ? isDark ? 'text-blue-400' : 'text-blue-600' 
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  title="Split view"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
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
        <div className="flex-1 flex overflow-hidden">
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`flex-1 overflow-y-auto ${
              viewMode === "split" ? "border-r" : ""
            } ${
              isDark ? "border-gray-700/50 bg-gray-900/30" : "border-gray-300/50 bg-gray-50/30"
            }`}>
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-transparent border-none text-3xl font-bold placeholder-gray-400 focus:outline-none font-serif ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                />
                
                <TagManager 
                  tags={tags} 
                  onTagsChange={setTags}
                  isDark={isDark}
                />
                
                <textarea
                  placeholder="Start writing your note... (Markdown supported)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full min-h-[400px] bg-transparent border-none text-lg placeholder-gray-500 focus:outline-none resize-none leading-relaxed font-light ${
                    isDark ? "text-gray-100" : "text-gray-700"
                  }`}
                />
              </div>
            </div>
          )}
          
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`flex-1 overflow-y-auto ${
              isDark ? "bg-gray-900/30" : "bg-gray-50/30"
            }`}>
              <MarkdownPreview content={content} isDark={isDark} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotesApp;
