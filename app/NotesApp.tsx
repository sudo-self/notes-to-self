"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Trash2,
  Plus,
  LogOut,
  Github,
  Save,
  Search,
  Notebook,
  SortAsc,
  SortDesc,
  Edit3,
  Clock,
  FileText,
  BookOpen,
  Zap,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  RotateCcw,
  Type,
  Calendar,
  Copy,
  Check,
  Share,
  Download,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading,
  LinkIcon,
  Tag,
  Filter,
  FileDown,
  Command,
  Star,
  Archive,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

type SortOption = "updated_desc" | "updated_asc" | "title_asc" | "title_desc" | "starred"
type ViewMode = "edit" | "preview" | "split"
type ExportFormat = "pdf" | "markdown" | "text"

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  tags?: string[]
  starred?: boolean
  archived?: boolean
  category?: string
}

// The User interface was previously declared twice. This is the corrected version.
interface User {
  id: string
  login: string
  avatar_url?: string
}

// Toast Component
const Toast = ({
  message,
  type = "success",
  onClose,
}: {
  message: string
  type?: "success" | "error"
  onClose: () => void
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 max-w-md w-full mx-4 ${
        type === "success" ? "bg-green-500/90 text-white border-green-400" : "bg-red-500/90 text-white border-red-400"
      }`}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Enhanced Note Item with theme support
const EnhancedNoteItem = React.memo(
  ({
    note,
    isSelected,
    onSelect,
    onDelete,
    onCopy,
    onShare,
    onToggleStar,
    onToggleArchive,
    isDark,
  }: {
    note: Note
    isSelected: boolean
    onSelect: (note: Note) => void
    onDelete: (noteId: string) => void
    onCopy: (note: Note) => void
    onShare: (note: Note) => void
    onToggleStar: (noteId: string) => void
    onToggleArchive: (noteId: string) => void
    isDark: boolean
  }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle")
    const [shareState, setShareState] = useState<"idle" | "sharing" | "shared">("idle")

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      } else if (diffDays === 1) {
        return "Yesterday"
      } else if (diffDays < 7) {
        return date.toLocaleDateString("en-GB", { weekday: "short" })
      } else {
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      }
    }

    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation()
      setCopyState("copying")

      try {
        await onCopy(note)
        setCopyState("copied")
        setTimeout(() => setCopyState("idle"), 1000)
      } catch (error) {
        setCopyState("idle")
      }
    }

    const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation()
      setShareState("sharing")

      try {
        await onShare(note)
        setShareState("shared")
        setTimeout(() => setShareState("idle"), 1000)
      } catch (error) {
        setShareState("idle")
      }
    }

    return (
      <div
        onClick={() => onSelect(note)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`p-4 border-b cursor-pointer transition-all duration-300 group ${
          isDark ? "border-gray-700/50" : "border-gray-300/50"
        } ${
          isSelected
            ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 border-l-4 border-blue-400 shadow-inner"
            : `hover:border-l-4 ${
                isDark
                  ? "hover:bg-gray-700/20 hover:border-gray-500/50"
                  : "hover:bg-gray-100/80 hover:border-gray-400/50"
              }`
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {note.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
              {note.archived && <Archive className="w-4 h-4 text-gray-400" />}
              <FileText className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <h3 className={`font-semibold truncate text-base ${isDark ? "text-white" : "text-gray-800"}`}>
                {note.title || "Untitled Note"}
              </h3>
            </div>
            <p className={`text-sm line-clamp-2 mb-3 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {note.content.substring(0, 100) || "No content yet..."}
            </p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
          <div className="flex flex-col items-center gap-1">
            {/* Star Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar(note.id)
              }}
              className={`transition-all duration-300 p-2 rounded-lg ${
                note.starred
                  ? "opacity-100 text-amber-400"
                  : (isHovered || isSelected)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
              } ${
                isDark ? "hover:text-amber-400 hover:bg-gray-600/50" : "hover:text-amber-600 hover:bg-gray-200/50"
              } transform hover:scale-110`}
              title={note.starred ? "Unstar note" : "Star note"}
            >
              <Star className={`w-4 h-4 ${note.starred ? "fill-amber-400" : ""}`} />
            </button>

            {/* Archive Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleArchive(note.id)
              }}
              className={`transition-all duration-300 p-2 rounded-lg ${
                isHovered || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${
                isDark
                  ? "text-gray-400 hover:text-purple-400 hover:bg-gray-600/50"
                  : "text-gray-500 hover:text-purple-600 hover:bg-gray-200/50"
              } transform hover:scale-110`}
              title={note.archived ? "Unarchive note" : "Archive note"}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`transition-all duration-300 p-2 rounded-lg ${
                isHovered || isSelected || shareState !== "idle" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${
                isDark
                  ? "text-gray-400 hover:text-green-400 hover:bg-gray-600/50"
                  : "text-gray-500 hover:text-green-600 hover:bg-gray-200/50"
              } transform hover:scale-110`}
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
              className={`transition-all duration-300 p-2 rounded-lg ${
                isHovered || isSelected || copyState !== "idle" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${
                isDark
                  ? "text-gray-400 hover:text-blue-400 hover:bg-gray-600/50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-200/50"
              } transform hover:scale-110`}
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
                e.stopPropagation()
                onDelete(note.id)
              }}
              className={`transition-all duration-300 p-2 rounded-lg ${
                isHovered || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${
                isDark
                  ? "text-gray-400 hover:text-red-400 hover:bg-gray-600/50"
                  : "text-gray-500 hover:text-red-600 hover:bg-gray-200/50"
              } transform hover:scale-110`}
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  },
)

EnhancedNoteItem.displayName = "EnhancedNoteItem"

// Markdown Toolbar Component
const MarkdownToolbar = ({
  onInsert,
  isDark,
}: {
  onInsert: (prefix: string, suffix?: string) => void
  isDark: boolean
}) => {
  const tools = [
    { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
    { icon: Italic, label: "Italic", prefix: "*", suffix: "*" },
    { icon: Heading, label: "Heading", prefix: "# ", suffix: "" },
    { icon: Code, label: "Code", prefix: "`", suffix: "`" },
    { icon: List, label: "List", prefix: "- ", suffix: "" },
    { icon: ListOrdered, label: "Numbered List", prefix: "1. ", suffix: "" },
    { icon: LinkIcon, label: "Link", prefix: "[", suffix: "](url)" },
  ]

  return (
    <div
      className={`flex items-center gap-1 p-2 border-b ${
        isDark ? "border-gray-700/50 bg-gray-800/50" : "border-gray-300/50 bg-gray-100/50"
      }`}
    >
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => onInsert(tool.prefix, tool.suffix)}
          className={`p-2 rounded transition-colors ${
            isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
          }`}
          title={tool.label}
        >
          <tool.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

// Export Modal Component
const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  isDark,
}: {
  isOpen: boolean
  onClose: () => void
  onExport: (format: ExportFormat) => void
  isDark: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`backdrop-blur-lg border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
          isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-300"
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>Export Note</h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              onExport("markdown")
              onClose()
            }}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              isDark
                ? "border-gray-600 hover:bg-gray-700 text-white"
                : "border-gray-300 hover:bg-gray-100 text-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileDown className="w-5 h-5" />
              <div>
                <div className="font-medium">Markdown (.md)</div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Export as markdown file</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onExport("text")
              onClose()
            }}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              isDark
                ? "border-gray-600 hover:bg-gray-700 text-white"
                : "border-gray-300 hover:bg-gray-100 text-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <div>
                <div className="font-medium">Plain Text (.txt)</div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Export as plain text</div>
              </div>
            </div>
          </button>
        </div>
        <button
          onClick={onClose}
          className={`mt-4 w-full py-2 rounded-lg transition-colors ${
            isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Tag Input Component
const TagInput = ({
  tags,
  onTagsChange,
  isDark,
}: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  isDark: boolean
}) => {
  const [inputValue, setInputValue] = useState("")

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className={`p-3 border-b ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Tag className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
        <input
          type="text"
          placeholder="Add tags..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addTag()
            }
          }}
          className={`flex-1 bg-transparent border-none text-sm placeholder-gray-400 focus:outline-none ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        />
        {inputValue && (
          <button onClick={addTag} className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            Add
          </button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Loading Skeleton with theme support
const NoteSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div className={`p-4 border-b animate-pulse ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
      <div className="flex-1 space-y-2">
        <div className={`h-4 rounded w-3/4 ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
        <div className={`h-3 rounded w-full ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
        <div className={`h-3 rounded w-1/2 ${isDark ? "bg-gray-600/30" : "bg-gray-300/30"}`}></div>
      </div>
    </div>
  </div>
)

// Stats Panel with theme support
const StatsPanel = ({
  notes,
  characterCount,
  isDark,
}: {
  notes: Note[]
  characterCount: number
  isDark: boolean
}) => (
  <div className={`flex items-center gap-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
    <div className="flex items-center gap-1">
      <BookOpen className="w-3 h-3" />
      <span>{notes.length} notes</span>
    </div>
    <div className="flex items-center gap-1">
      <Type className="w-3 h-3" />
      <span>{characterCount} chars</span>
    </div>
  </div>
)

// Confirmation Dialog with theme support
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDark,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDark: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`backdrop-blur-lg border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
          isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-300"
        }`}
      >
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>{title}</h3>
        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 transition-colors ${
              isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// Theme Toggle Component
const ThemeToggle = ({
  isDark,
  setIsDark,
}: {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
}) => (
  <button
    onClick={() => setIsDark(!isDark)}
    className={`p-2 rounded-lg transition-all duration-300 group ${
      isDark
        ? "text-gray-400 hover:text-amber-400 hover:bg-gray-700/50"
        : "text-gray-500 hover:text-amber-600 hover:bg-gray-200/50"
    }`}
    title={`Switch to ${isDark ? "light" : "dark"} mode`}
  >
    {isDark ? (
      <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" />
    ) : (
      <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    )}
  </button>
)

// Keyboard Shortcuts Help Modal
const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
  isDark,
}: {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
}) => {
  if (!isOpen) return null

  const shortcuts = [
    { key: "Cmd/Ctrl + S", action: "Save note" },
    { key: "Cmd/Ctrl + N", action: "New note" },
    { key: "Cmd/Ctrl + K", action: "Search notes" },
    { key: "Cmd/Ctrl + E", action: "Toggle preview" },
    { key: "Cmd/Ctrl + B", action: "Bold text" },
    { key: "Cmd/Ctrl + I", action: "Italic text" },
    { key: "Cmd/Ctrl + /", action: "Show shortcuts" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`backdrop-blur-lg border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
          isDark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>{shortcut.action}</span>
              <kbd
                className={`px-3 py-1 rounded text-sm font-mono ${
                  isDark
                    ? "bg-gray-700 text-gray-200 border border-gray-600"
                    : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const EnhancedNotesApp = () => {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("updated_desc")
  const [viewMode, setViewMode] = useState<ViewMode>("edit")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [characterCount, setCharacterCount] = useState(0)
  const [autoSave, setAutoSave] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)

  // Theme state
  const [isDark, setIsDark] = useState(true)

  // Use refs to prevent infinite loops
  const autoSaveInProgress = useRef(false)
  const lastSavedContent = useRef({ title: "", content: "", tags: [] as string[] })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Theme effect
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }

    // Store theme preference
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      setIsDark(systemPrefersDark)
    }
  }, [])

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
  }

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm()
        setConfirmationDialog(null)
      },
    })
  }

  const closeConfirmation = () => {
    setConfirmationDialog(null)
  }

  const copyNoteToClipboard = async (note: Note) => {
    try {
      const textToCopy = note.title ? `${note.title}\n\n${note.content}` : note.content
      await navigator.clipboard.writeText(textToCopy)
      showToast("Note copied to clipboard!")
      return true
    } catch (error) {
      console.error("Failed to copy note:", error)
      showToast("Failed to copy note", "error")
      return false
    }
  }

  const shareNote = async (note: Note) => {
    try {
      const textToShare = note.title ? `${note.title}\n\n${note.content}` : note.content

      if (navigator.share) {
        await navigator.share({
          title: note.title || "Note from NTS",
          text: textToShare,
          url: window.location.href,
        })
        showToast("Note shared!")
      } else {
        await navigator.clipboard.writeText(textToShare)
        showToast("Note copied to clipboard (share not available)")
      }
      return true
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to share note:", error)
        showToast("Failed to share note", "error")
      }
      return false
    }
  }

  const toggleStar = (noteId: string) => {
    setNotes(notes.map((note) => (note.id === noteId ? { ...note, starred: !note.starred } : note)))
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, starred: !selectedNote.starred })
    }
    showToast(notes.find((n) => n.id === noteId)?.starred ? "Note unstarred" : "Note starred!")
  }

  const toggleArchive = (noteId: string) => {
    setNotes(notes.map((note) => (note.id === noteId ? { ...note, archived: !note.archived } : note)))
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, archived: !selectedNote.archived })
    }
    showToast(notes.find((n) => n.id === noteId)?.archived ? "Note unarchived" : "Note archived!")
  }

  const exportNote = (format: ExportFormat) => {
    if (!selectedNote) return

    const filename = selectedNote.title || "note"
    let content = ""
    let mimeType = ""
    let extension = ""

    if (format === "markdown") {
      content = `# ${selectedNote.title}\n\n${selectedNote.content}`
      if (selectedNote.tags && selectedNote.tags.length > 0) {
        content += `\n\n---\nTags: ${selectedNote.tags.map((t) => `#${t}`).join(", ")}`
      }
      mimeType = "text/markdown"
      extension = "md"
    } else if (format === "text") {
      content = selectedNote.title ? `${selectedNote.title}\n\n${selectedNote.content}` : selectedNote.content
      mimeType = "text/plain"
      extension = "txt"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${extension}`
    a.click()
    URL.revokeObjectURL(url)

    showToast(`Note exported as ${format}!`)
  }

  const insertMarkdown = (prefix: string, suffix = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end)

    setContent(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + prefix.length + (selectedText ? selectedText.length : 0)
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            saveNote()
            break
          case "n":
            e.preventDefault()
            createNewNote()
            break
          case "k":
            e.preventDefault()
            document.getElementById("search-input")?.focus()
            break
          case "e":
            e.preventDefault()
            setViewMode((prev) => (prev === "edit" ? "split" : "edit"))
            break
          case "b":
            e.preventDefault()
            insertMarkdown("**", "**")
            break
          case "i":
            e.preventDefault()
            insertMarkdown("*", "*")
            break
          case "/":
            e.preventDefault()
            setShortcutsModalOpen(true)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [content, selectedNote])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Character count and change detection
  useEffect(() => {
    setCharacterCount(content.length)

    const isChanged = selectedNote
      ? title !== selectedNote.title ||
        content !== selectedNote.content ||
        JSON.stringify(tags) !== JSON.stringify(selectedNote.tags || [])
      : title.trim() !== "" || content.trim() !== "" || tags.length > 0

    setHasUnsavedChanges(isChanged)
  }, [title, content, tags, selectedNote])

  // Auto-save functionality
  useEffect(() => {
    if (
      autoSave &&
      hasUnsavedChanges &&
      user &&
      (title.trim() || content.trim()) &&
      !saving &&
      !autoSaveInProgress.current &&
      (title !== lastSavedContent.current.title ||
        content !== lastSavedContent.current.content ||
        JSON.stringify(tags) !== JSON.stringify(lastSavedContent.current.tags))
    ) {
      autoSaveInProgress.current = true

      const autoSaveTimer = setTimeout(() => {
        if (!saving) {
          saveNote()
        }
      }, 2000)

      return () => {
        clearTimeout(autoSaveTimer)
        autoSaveInProgress.current = false
      }
    }
  }, [title, content, tags, autoSave, hasUnsavedChanges, saving, user])

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github"
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setNotes([])
      setSelectedNote(null)
      setTitle("")
      setContent("")
      setTags([])
      lastSavedContent.current = { title: "", content: "", tags: [] }
    }
  }

  const loadNotes = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/notes?userId=${user.id}`)
      if (!res.ok) throw new Error("Failed to load notes")
      const data = await res.json()
      setNotes(data)
    } catch (err) {
      console.error("Failed to load notes:", err)
      showToast("Failed to load notes", "error")
    } finally {
      setLoading(false)
    }
  }, [user])

  const saveNote = async () => {
    if ((!title.trim() && !content.trim()) || !user || !hasUnsavedChanges) return

    if (
      title === lastSavedContent.current.title &&
      content === lastSavedContent.current.content &&
      JSON.stringify(tags) === JSON.stringify(lastSavedContent.current.tags)
    ) {
      return
    }

    setSaving(true)
    const payload = {
      id: selectedNote?.id,
      userId: user.id,
      title: title.trim() || "Untitled Note",
      content: content.trim(),
      tags: tags,
      starred: selectedNote?.starred || false,
      archived: selectedNote?.archived || false,
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Save failed")
      const savedNote: Note = await res.json()

      if (selectedNote) {
        setNotes(notes.map((n) => (n.id === savedNote.id ? savedNote : n)))
        setSelectedNote(savedNote)
      } else {
        setNotes([savedNote, ...notes])
        setSelectedNote(savedNote)
      }

      lastSavedContent.current = { title, content, tags }
      setHasUnsavedChanges(false)
      showToast("Note saved!")
    } catch (err) {
      console.error("Save error:", err)
      showToast("Failed to save note", "error")
    } finally {
      setSaving(false)
      autoSaveInProgress.current = false
    }
  }

  const createNewNote = () => {
    if (hasUnsavedChanges) {
      showConfirmation("Unsaved Changes", "You have unsaved changes. Create new note anyway?", () => {
        setSelectedNote(null)
        setTitle("")
        setContent("")
        setTags([])
        setHasUnsavedChanges(false)
        lastSavedContent.current = { title: "", content: "", tags: [] }
      })
    } else {
      setSelectedNote(null)
      setTitle("")
      setContent("")
      setTags([])
      setHasUnsavedChanges(false)
      lastSavedContent.current = { title: "", content: "", tags: [] }
    }
  }

  const selectNote = useCallback(
    (note: Note) => {
      if (hasUnsavedChanges) {
        showConfirmation("Unsaved Changes", "You have unsaved changes. Switch note anyway?", () => {
          setSelectedNote(note)
          setTitle(note.title)
          setContent(note.content)
          setTags(note.tags || [])
          setHasUnsavedChanges(false)
          lastSavedContent.current = { title: note.title, content: note.content, tags: note.tags || [] }
        })
      } else {
        setSelectedNote(note)
        setTitle(note.title)
        setContent(note.content)
        setTags(note.tags || [])
        setHasUnsavedChanges(false)
        lastSavedContent.current = { title: note.title, content: note.content, tags: note.tags || [] }
      }
    },
    [hasUnsavedChanges],
  )

  const deleteNote = async (noteId: string) => {
    showConfirmation(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`/api/notes?noteId=${noteId}`, {
            method: "DELETE",
          })

          if (!res.ok) throw new Error("Delete request failed")

          setNotes(notes.filter((n) => n.id !== noteId))
          if (selectedNote?.id === noteId) {
            setSelectedNote(null)
            setTitle("")
            setContent("")
            setTags([])
            setHasUnsavedChanges(false)
            lastSavedContent.current = { title: "", content: "", tags: [] }
          }
          showToast("Note deleted")
        } catch (err) {
          console.error("Delete error:", err)
          showToast("Failed to delete note", "error")
        }
      },
    )
  }

  const getSortedNotes = useMemo(() => {
    const sortableNotes = [...notes]
    sortableNotes.sort((a, b) => {
      switch (sortOption) {
        case "starred":
          if (a.starred && !b.starred) return -1
          if (!a.starred && b.starred) return 1
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "updated_desc":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "updated_asc":
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case "title_asc":
          return a.title.localeCompare(b.title)
        case "title_desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
    return sortableNotes
  }, [notes, sortOption])

  const filteredNotes = useMemo(() => {
    return getSortedNotes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        note.content.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesArchive = showArchived ? note.archived : !note.archived

      const matchesTag = selectedTag ? note.tags?.includes(selectedTag) : true

      return matchesSearch && matchesArchive && matchesTag
    })
  }, [getSortedNotes, debouncedSearch, showArchived, selectedTag])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // User and notes loading
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const u: User = await res.json()
          setUser(u)
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user, loadNotes])

  // Real-time clock
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
        }),
      )
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
            : "bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100"
        }`}
      >
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        <div
          className={`backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border shadow-2xl transition-colors duration-300 ${
            isDark ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-200/50"
          }`}
        >
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-400 to-purple-500"
              }`}
            >
              <Notebook className="w-10 h-10 text-white" />
            </div>
            <h1
              className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              NTS
            </h1>
            <p className={`mb-2 transition-colors duration-300 ${isDark ? "text-blue-200" : "text-blue-600"}`}>
              Notes To Self
            </p>
            <p
              className={`text-xs font-mono transition-colors duration-300 ${
                isDark ? "text-cyan-200" : "text-cyan-600"
              }`}
            >
              {currentTime}
            </p>
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
            {loading ? "Connecting..." : "Sign in"}
          </button>
          <div className={`mt-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>All notes are private and secure</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
          : "bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100"
      }`}
    >
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          onClose={closeConfirmation}
          onConfirm={confirmationDialog.onConfirm}
          title={confirmationDialog.title}
          message={confirmationDialog.message}
          isDark={isDark}
        />
      )}

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={exportNote}
        isDark={isDark}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        isDark={isDark}
      />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 backdrop-blur-sm p-2 rounded-lg border transition-colors duration-300 ${
          isDark ? "bg-gray-800/90 text-white border-gray-600" : "bg-white/90 text-gray-800 border-gray-300"
        }`}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
        w-80 backdrop-blur-lg border-r flex flex-col h-screen transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:relative z-40
        ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white/80 border-gray-300/50"}
      `}
      >
        {/* User Info & New Note */}
        <div className={`p-4 border-b flex-shrink-0 ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || "./avatar-192.png"}
                alt="User avatar"
                className="w-10 h-10 rounded-lg object-cover border-2 border-blue-400/50"
              />
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}>@{user.login}</p>
                <StatsPanel notes={notes} characterCount={characterCount} isDark={isDark} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShortcutsModalOpen(true)}
                className={`transition-colors p-2 rounded-lg ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                }`}
                title="Keyboard shortcuts"
              >
                <Command className="w-5 h-5" />
              </button>
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

        {/* Search & Sort */}
        <div className={`p-4 border-b flex-shrink-0 space-y-3 ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
          <div className="relative">
            <Search
              className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              id="search-input"
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

          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sort-select" className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Sort:
            </label>
            <div className="relative flex-1">
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className={`block w-full border rounded-lg py-1 px-3 text-sm focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-gray-700/50 border-gray-600/50 text-white"
                    : "bg-gray-100/50 border-gray-300/50 text-gray-800"
                }`}
              >
                <option value="starred" className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                  Starred First
                </option>
                <option value="updated_desc" className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                  Latest Update
                </option>
                <option value="updated_asc" className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                  Oldest Update
                </option>
                <option value="title_asc" className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                  Title (A-Z)
                </option>
                <option value="title_desc" className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                  Title (Z-A)
                </option>
              </select>
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {sortOption.includes("asc") ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`w-full py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
              showArchived
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/50"
                : isDark
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100/50 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className={`text-xs flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Filter className="w-3 h-3" />
                <span>Filter by tag:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    !selectedTag
                      ? "bg-blue-500 text-white"
                      : isDark
                        ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-500 text-white"
                        : isDark
                          ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            <div className={`p-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {debouncedSearch || selectedTag
                  ? "No notes found"
                  : showArchived
                    ? "No archived notes"
                    : "No notes yet"}
              </p>
              <p className="text-sm">
                {debouncedSearch || selectedTag
                  ? "Try adjusting your filters"
                  : showArchived
                    ? "Archive notes to see them here"
                    : "Create your first note to get started"}
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
                onToggleStar={toggleStar}
                onToggleArchive={toggleArchive}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Editor Header */}
        <div
          className={`p-6 border-b flex items-center justify-between backdrop-blur-lg flex-shrink-0 ${
            isDark ? "border-gray-700/50 bg-gray-800/50" : "border-gray-300/50 bg-white/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {selectedNote ? (
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Editing note</span>
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>•</span>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
              <div className={`flex items-center gap-1 text-xs ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                <Zap className="w-3 h-3" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <StatsPanel
              notes={[selectedNote].filter(Boolean) as Note[]}
              characterCount={characterCount}
              isDark={isDark}
            />

            <div className={`flex items-center gap-1 rounded-lg p-1 ${isDark ? "bg-gray-700/50" : "bg-gray-200/50"}`}>
              <button
                onClick={() => setViewMode("edit")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "edit"
                    ? isDark
                      ? "bg-blue-500 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-800"
                }`}
                title="Edit mode"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "split"
                    ? isDark
                      ? "bg-blue-500 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-800"
                }`}
                title="Split view"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {selectedNote && (
              <button
                onClick={() => setExportModalOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                }`}
                title="Export note"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <div className={`flex items-center gap-2 rounded-lg p-1 ${isDark ? "bg-gray-700/50" : "bg-gray-200/50"}`}>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`p-1 rounded text-xs ${
                  autoSave ? (isDark ? "text-green-400" : "text-green-600") : isDark ? "text-gray-400" : "text-gray-500"
                }`}
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

        <TagInput tags={tags} onTagsChange={setTags} isDark={isDark} />

        {viewMode !== "preview" && <MarkdownToolbar onInsert={insertMarkdown} isDark={isDark} />}

        {/* Editor Content */}
        <div className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900/30" : "bg-gray-50/30"}`}>
          <div className={`${viewMode === "split" ? "grid grid-cols-2 gap-0 h-full" : ""}`}>
            {/* Edit View */}
            {viewMode !== "preview" && (
              <div
                className={`${viewMode === "split" ? "border-r " + (isDark ? "border-gray-700/50" : "border-gray-300/50") : ""} max-w-4xl mx-auto p-6 w-full`}
              >
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-transparent border-none text-3xl font-bold placeholder-gray-400 focus:outline-none mb-6 font-serif ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                />
                <textarea
                  ref={textareaRef}
                  placeholder="Note to self..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full min-h-[60vh] bg-transparent border-none text-lg placeholder-gray-500 focus:outline-none resize-none leading-relaxed font-light ${
                    isDark ? "text-gray-100" : "text-gray-700"
                  }`}
                  style={{ height: "auto" }}
                />
              </div>
            )}

            {viewMode !== "edit" && (
              <div
                className={`max-w-4xl mx-auto p-6 w-full overflow-y-auto ${
                  viewMode === "split" ? "bg-opacity-50" : ""
                }`}
              >
                <h1 className={`text-3xl font-bold mb-6 font-serif ${isDark ? "text-white" : "text-gray-800"}`}>
                  {title || "Untitled Note"}
                </h1>
                <div className={`prose ${isDark ? "prose-invert" : ""} max-w-none`}>
                  <ReactMarkdown>{content || "*No content yet...*"}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedNotesApp
