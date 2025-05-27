"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, MessageSquare, BarChart3, Settings, LogOut } from "lucide-react"
import { HabitModal } from "./components/habit-modal"
import AnalysisPage from "./components/analysis-page"
import SettingsPage from "./components/settings-page"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"

interface Habit {
  id: string
  name: string
  frequency: "daily" | "weekly"
  weekdays?: number[]
  goal?: string
  notification?: boolean
  notificationTime?: string
  color?: string
  completed: { [date: string]: boolean }
  notes: { [date: string]: string }
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [currentPage, setCurrentPage] = useState<"dashboard" | "analysis" | "settings">("dashboard")
  const [noteModalOpen, setNoteModalOpen] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  // Load habits from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    } else {
      // Initialize with sample habits
      const sampleHabits: Habit[] = [
        {
          id: "1",
          name: "6:00 起床",
          frequency: "daily",
          goal: "毎朝6時に起床",
          color: "#3b82f6",
          completed: { [format(new Date(), "yyyy-MM-dd")]: true },
          notes: {},
        },
        {
          id: "2",
          name: "30分間の読書",
          frequency: "daily",
          goal: "1日30分",
          color: "#10b981",
          completed: {},
          notes: {},
        },
        {
          id: "3",
          name: "1日2Lの水を飲む",
          frequency: "daily",
          goal: "2リットル",
          color: "#06b6d4",
          completed: { [format(new Date(), "yyyy-MM-dd")]: true },
          notes: {},
        },
      ]
      setHabits(sampleHabits)
      localStorage.setItem("habits", JSON.stringify(sampleHabits))
    }
  }, [])

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const dateKey = format(currentDate, "yyyy-MM-dd")
  const todaysHabits = habits.filter((habit) => {
    if (habit.frequency === "daily") return true
    if (habit.frequency === "weekly" && habit.weekdays) {
      return habit.weekdays.includes(currentDate.getDay())
    }
    return false
  })

  const completedCount = todaysHabits.filter((habit) => habit.completed[dateKey]).length
  const completionRate = todaysHabits.length > 0 ? Math.round((completedCount / todaysHabits.length) * 100) : 0

  const toggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completed: {
                ...habit.completed,
                [dateKey]: !habit.completed[dateKey],
              },
            }
          : habit,
      ),
    )
  }

  const addHabit = (habitData: Omit<Habit, "id" | "completed" | "notes">) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      completed: {},
      notes: {},
    }
    setHabits((prev) => [...prev, newHabit])
  }

  const updateHabit = (habitId: string, habitData: Omit<Habit, "id" | "completed" | "notes">) => {
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? { ...habit, ...habitData } : habit)))
  }

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
  }

  const saveNote = (habitId: string, note: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              notes: {
                ...habit.notes,
                [dateKey]: note,
              },
            }
          : habit,
      ),
    )
  }

  const getCalendarData = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return days.map((day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      const dayHabits = habits.filter((habit) => {
        if (habit.frequency === "daily") return true
        if (habit.frequency === "weekly" && habit.weekdays) {
          return habit.weekdays.includes(day.getDay())
        }
        return false
      })
      const dayCompleted = dayHabits.filter((habit) => habit.completed[dayKey]).length
      const dayTotal = dayHabits.length
      const dayRate = dayTotal > 0 ? dayCompleted / dayTotal : 0

      return {
        date: day,
        rate: dayRate,
        completed: dayCompleted,
        total: dayTotal,
      }
    })
  }

  if (currentPage === "analysis") {
    return <AnalysisPage habits={habits} onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "settings") {
    return <SettingsPage habits={habits} setHabits={setHabits} onBack={() => setCurrentPage("dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">HabitTracker</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage("analysis")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              分析ページへ
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage("settings")}>
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate((prev) => subDays(prev, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">{format(currentDate, "yyyy年MM月dd日 (E)", { locale: ja })}</h2>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate((prev) => addDays(prev, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Habits */}
            <Card>
              <CardHeader>
                <CardTitle>今日の習慣リスト</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={habit.completed[dateKey] || false}
                      onCheckedChange={() => toggleHabit(habit.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{habit.name}</span>
                        {habit.color && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                        )}
                      </div>
                      {habit.goal && <p className="text-sm text-gray-600">{habit.goal}</p>}
                      {habit.notes[dateKey] && (
                        <Badge variant="secondary" className="mt-1">
                          メモあり
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingHabit(habit)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        編集
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="w-4 h-4" />
                        削除
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNoteModalOpen(habit.id)
                          setNoteText(habit.notes[dateKey] || "")
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        メモ
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  className="w-full"
                  onClick={() => {
                    setEditingHabit(null)
                    setIsModalOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新しい習慣を追加
                </Button>
              </CardContent>
            </Card>

            {/* Today's Achievement */}
            <Card>
              <CardHeader>
                <CardTitle>今日の達成度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      達成数 {completedCount}/{todaysHabits.length}
                    </span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>週間カレンダービュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                    <div key={day} className="font-medium text-sm p-2">
                      {day}
                    </div>
                  ))}
                  {getCalendarData().map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                        isSameDay(day.date, currentDate) ? "bg-blue-100 border-blue-300" : "hover:bg-gray-50"
                      }`}
                      style={{
                        backgroundColor: day.rate > 0 ? `rgba(59, 130, 246, ${day.rate * 0.5 + 0.1})` : undefined,
                      }}
                      onClick={() => setCurrentDate(day.date)}
                    >
                      <div className="font-medium">{format(day.date, "d")}</div>
                      {day.total > 0 && (
                        <div className="text-xs text-gray-600">
                          {day.completed}/{day.total}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingHabit(null)
        }}
        onSave={editingHabit ? (data) => updateHabit(editingHabit.id, data) : addHabit}
        habit={editingHabit}
      />

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">メモを編集</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg resize-none"
              placeholder="今日の習慣についてメモを残しましょう..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setNoteModalOpen(null)}>
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  if (noteModalOpen) {
                    saveNote(noteModalOpen, noteText)
                    setNoteModalOpen(null)
                  }
                }}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
