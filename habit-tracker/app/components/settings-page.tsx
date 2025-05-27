"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Download, Upload, Trash2, User, Bell, Database, Palette } from "lucide-react"

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

interface SettingsPageProps {
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  onBack: () => void
}

export function SettingsPage({ habits, setHabits, onBack }: SettingsPageProps) {
  const [username, setUsername] = useState("ユーザー")
  const [email, setEmail] = useState("user@example.com")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [defaultNotificationTime, setDefaultNotificationTime] = useState("09:00")
  const [theme, setTheme] = useState("light")

  const exportData = () => {
    const data = {
      habits,
      settings: {
        username,
        email,
        notificationsEnabled,
        defaultNotificationTime,
        theme,
      },
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `habit-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.habits && Array.isArray(data.habits)) {
          setHabits(data.habits)
          if (data.settings) {
            setUsername(data.settings.username || username)
            setEmail(data.settings.email || email)
            setNotificationsEnabled(data.settings.notificationsEnabled ?? notificationsEnabled)
            setDefaultNotificationTime(data.settings.defaultNotificationTime || defaultNotificationTime)
            setTheme(data.settings.theme || theme)
          }
          alert("データのインポートが完了しました。")
        } else {
          alert("無効なファイル形式です。")
        }
      } catch (error) {
        alert("ファイルの読み込みに失敗しました。")
      }
    }
    reader.readAsText(file)
  }

  const resetAllData = () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      setHabits([])
      localStorage.removeItem("habits")
      alert("すべてのデータが削除されました。")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードへ
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                アカウント
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ユーザー名</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button variant="outline" className="w-full">
                パスワード変更
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                <Label>デスクトップ通知を有効にする</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTime">デフォルト通知時間</Label>
                <Input
                  id="defaultTime"
                  type="time"
                  value={defaultNotificationTime}
                  onChange={(e) => setDefaultNotificationTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                データ管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                データをエクスポート (JSON)
              </Button>

              <div>
                <Label htmlFor="import" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      データをインポート (JSON)
                    </span>
                  </Button>
                </Label>
                <Input id="import" type="file" accept=".json" className="hidden" onChange={importData} />
                <p className="text-xs text-gray-600 mt-2">※ 既存のデータは上書きされます</p>
              </div>

              <Button variant="destructive" className="w-full" onClick={resetAllData}>
                <Trash2 className="w-4 h-4 mr-2" />
                全データをリセットする
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                テーマ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">ライトモード</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">ダークモード</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>アプリ情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
                  <div className="text-sm text-gray-600">登録済み習慣</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      Object.values(habits.reduce((acc, habit) => ({ ...acc, ...habit.completed }), {})).filter(Boolean)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">総達成回数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(
                      ...habits.map((habit) => {
                        let streak = 0
                        const today = new Date()
                        for (let i = 0; i < 30; i++) {
                          const checkDate = new Date(today)
                          checkDate.setDate(today.getDate() - i)
                          const dateKey = checkDate.toISOString().split("T")[0]

                          if (habit.completed[dateKey]) {
                            streak++
                          } else {
                            break
                          }
                        }
                        return streak
                      }),
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">最長連続記録</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
