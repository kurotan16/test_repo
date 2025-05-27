"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"

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

interface HabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: Omit<Habit, "id" | "completed" | "notes">) => void
  habit?: Habit | null
}

const colors = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6b7280",
]

const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"]

export function HabitModal({ isOpen, onClose, onSave, habit }: HabitModalProps) {
  const [name, setName] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily")
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [goal, setGoal] = useState("")
  const [notification, setNotification] = useState(false)
  const [notificationTime, setNotificationTime] = useState("09:00")
  const [color, setColor] = useState(colors[0])

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setFrequency(habit.frequency)
      setWeekdays(habit.weekdays || [])
      setGoal(habit.goal || "")
      setNotification(habit.notification || false)
      setNotificationTime(habit.notificationTime || "09:00")
      setColor(habit.color || colors[0])
    } else {
      setName("")
      setFrequency("daily")
      setWeekdays([])
      setGoal("")
      setNotification(false)
      setNotificationTime("09:00")
      setColor(colors[0])
    }
  }, [habit, isOpen])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      frequency,
      weekdays: frequency === "weekly" ? weekdays : undefined,
      goal: goal.trim() || undefined,
      notification,
      notificationTime: notification ? notificationTime : undefined,
      color,
    })

    onClose()
  }

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{habit ? "習慣を編集" : "新しい習慣を追加"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">習慣名 *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 30分間の読書" />
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>頻度</Label>
            <RadioGroup value={frequency} onValueChange={(value: "daily" | "weekly") => setFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">毎日</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">曜日指定</Label>
              </div>
            </RadioGroup>

            {frequency === "weekly" && (
              <div className="grid grid-cols-7 gap-2 mt-3">
                {weekdayNames.map((day, index) => (
                  <div key={index} className="text-center">
                    <Checkbox checked={weekdays.includes(index)} onCheckedChange={() => toggleWeekday(index)} />
                    <div className="text-sm mt-1">{day}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">目標 (任意)</Label>
            <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例: 30分、2リットル" />
          </div>

          {/* Notification */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox checked={notification} onCheckedChange={setNotification} />
              <Label>通知する</Label>
            </div>
            {notification && (
              <div className="space-y-2">
                <Label htmlFor="time">通知時間</Label>
                <Input
                  id="time"
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Color */}
          <div className="space-y-3">
            <Label>色</Label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-gray-400" : "border-gray-200"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
