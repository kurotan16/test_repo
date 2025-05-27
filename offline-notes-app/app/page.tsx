"use client"

import { useState } from "react"
import {
  Search,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Trash2,
  Save,
  ArrowLeft,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Note {
  id: string
  title: string
  content: string
  folderId: string
  createdAt: Date
  updatedAt: Date
}

interface FolderType {
  id: string
  name: string
  parentId: string | null
  noteCount: number
}

export default function OfflineNotesApp() {
  const [currentView, setCurrentView] = useState<"main" | "edit" | "search">("main")
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTarget, setSearchTarget] = useState<"title" | "content">("title")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["folders"]))

  // Settings
  const [settings, setSettings] = useState({
    rootFolder: "/path/to/user/documents/MyNotes",
    defaultSort: "updated" as "updated" | "created" | "title",
    theme: "light" as "light" | "dark" | "system",
    autoSave: true,
  })

  // Sample data
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "プロジェクトのアイデア",
      content:
        "オフラインで動作するメモアプリを作成する。ローカルストレージを使用してデータを保存し、フォルダー機能も実装する。",
      folderId: "folder1",
      createdAt: new Date("2024-01-15T10:30:00"),
      updatedAt: new Date("2024-01-20T14:45:00"),
    },
    {
      id: "2",
      title: "買い物リスト",
      content: "牛乳、パン、卵、野菜、果物を買う。週末の料理の準備も忘れずに。",
      folderId: "folder2",
      createdAt: new Date("2024-01-18T09:15:00"),
      updatedAt: new Date("2024-01-19T16:20:00"),
    },
    {
      id: "3",
      title: "会議メモ",
      content: "次回のプロジェクト会議は来週火曜日。議題：進捗確認、課題の洗い出し、次のマイルストーン設定。",
      folderId: "folder1",
      createdAt: new Date("2024-01-16T13:00:00"),
      updatedAt: new Date("2024-01-17T11:30:00"),
    },
  ])

  const [folders, setFolders] = useState<FolderType[]>([
    { id: "folder1", name: "プロジェクト", parentId: null, noteCount: 2 },
    { id: "folder2", name: "個人", parentId: null, noteCount: 1 },
    { id: "subfolder1", name: "サブプロジェクト", parentId: "folder1", noteCount: 0 },
  ])

  const filteredNotes = notes.filter((note) => {
    if (currentView === "search") {
      if (searchTarget === "title") {
        return note.title.toLowerCase().includes(searchQuery.toLowerCase())
      } else {
        return (
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
    }

    if (selectedFolderId === "all") return true
    if (selectedFolderId === "trash") return false // ゴミ箱機能は今回は省略
    return note.folderId === selectedFolderId
  })

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case "updated":
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case "created":
        return b.createdAt.getTime() - a.createdAt.getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "新しいメモ",
      content: "",
      folderId: selectedFolderId === "all" ? "folder1" : selectedFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setNotes([...notes, newNote])
    setEditingNote(newNote)
    setCurrentView("edit")
  }

  const saveNote = () => {
    if (editingNote) {
      setNotes(notes.map((note) => (note.id === editingNote.id ? { ...editingNote, updatedAt: new Date() } : note)))
      setCurrentView("main")
      setEditingNote(null)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    return folders
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => (
        <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
          <div
            className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded ${
              selectedFolderId === folder.id ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedFolderId(folder.id)}
          >
            <Folder className="w-4 h-4" />
            <span className="text-sm">{folder.name}</span>
            <span className="text-xs text-gray-500">({folder.noteCount}件)</span>
          </div>
          {expandedFolders.has(folder.id) && renderFolderTree(folder.id, level + 1)}
        </div>
      ))
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.replace(regex, "<mark>$1</mark>")
  }

  if (currentView === "edit" && editingNote) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("main")}>
              <ArrowLeft className="w-4 h-4" />
              戻る
            </Button>
            <Input
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="text-lg font-medium border-none shadow-none p-0"
              placeholder="メモのタイトル"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={saveNote} size="sm">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>フォルダーへ移動</DropdownMenuItem>
                <DropdownMenuItem>タグ付け</DropdownMenuItem>
                <DropdownMenuItem>削除</DropdownMenuItem>
                <DropdownMenuItem>エクスポート</DropdownMenuItem>
                <DropdownMenuItem>情報</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <Textarea
            value={editingNote.content}
            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
            placeholder="メモの内容を入力してください..."
            className="w-full h-full resize-none border-none shadow-none text-base"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500">
          <span>作成日時: {editingNote.createdAt.toLocaleString("ja-JP")}</span>
          <span>更新日時: {editingNote.updatedAt.toLocaleString("ja-JP")}</span>
          <span>文字数: {editingNote.content.length}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">OfflineNotes</h1>
        <div className="flex items-center gap-4">
          {currentView === "search" ? (
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索ワードを入力..."
                className="w-64"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView("main")
                  setSearchQuery("")
                }}
              >
                ×
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("search")}>
              <Search className="w-4 h-4" />
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>設定</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">メモ保存ルートフォルダー</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={settings.rootFolder} readOnly className="flex-1" />
                    <Button variant="outline" size="sm">
                      変更...
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">デフォルトの並び替え</Label>
                  <Select
                    value={settings.defaultSort}
                    onValueChange={(value: any) => setSettings({ ...settings, defaultSort: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated">更新日時順</SelectItem>
                      <SelectItem value="created">作成日時順</SelectItem>
                      <SelectItem value="title">タイトル順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">テーマ</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: any) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">ライト</SelectItem>
                      <SelectItem value="dark">ダーク</SelectItem>
                      <SelectItem value="system">システム設定に従う</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">自動保存</Label>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                  />
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">バージョン情報</Label>
                  <p className="text-sm text-gray-500 mt-1">OfflineNotes v1.0.0</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4 space-y-2">
            <div
              className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded ${
                selectedFolderId === "all" ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedFolderId("all")}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">すべてのメモ</span>
              <span className="text-xs text-gray-500">({notes.length}件)</span>
            </div>

            <div>
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => toggleFolder("folders")}
              >
                {expandedFolders.has("folders") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">フォルダー</span>
              </div>
              {expandedFolders.has("folders") && (
                <div className="ml-4">
                  {renderFolderTree()}
                  <div className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded text-blue-600">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">新規フォルダー作成...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">ゴミ箱</span>
                <span className="text-xs text-gray-500">(0件)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="font-medium">
                {currentView === "search"
                  ? `検索結果: "${searchQuery}"`
                  : selectedFolderId === "all"
                    ? "すべてのメモ"
                    : folders.find((f) => f.id === selectedFolderId)?.name || "フォルダー"}
              </h2>
              {currentView === "search" && (
                <div className="flex items-center gap-4 mt-2">
                  <Select value={searchTarget} onValueChange={(value: any) => setSearchTarget(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">タイトル</SelectItem>
                      <SelectItem value="content">全文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">更新日時順</SelectItem>
                  <SelectItem value="created">作成日時順</SelectItem>
                  <SelectItem value="title">タイトル順</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createNewNote} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                新規メモ
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sortedNotes.map((note) => (
                <Card
                  key={note.id}
                  className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => {
                    setEditingNote(note)
                    setCurrentView("edit")
                  }}
                >
                  <h3
                    className="font-medium mb-2"
                    dangerouslySetInnerHTML={{
                      __html: currentView === "search" ? highlightText(note.title, searchQuery) : note.title,
                    }}
                  />
                  <p className="text-sm text-gray-500 mb-2">更新日時: {note.updatedAt.toLocaleString("ja-JP")}</p>
                  <p
                    className="text-sm text-gray-700 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html:
                        currentView === "search"
                          ? highlightText(note.content.substring(0, 100) + "...", searchQuery)
                          : note.content.substring(0, 100) + "...",
                    }}
                  />
                </Card>
              ))}
              {sortedNotes.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {currentView === "search"
                    ? `"${searchQuery}" に一致するメモが見つかりませんでした`
                    : "メモがありません"}
                </div>
              )}
              {currentView === "search" && sortedNotes.length > 0 && (
                <div className="text-center text-gray-500 py-4">{sortedNotes.length}件ヒットしました</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
