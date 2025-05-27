"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, Calendar, Target } from "lucide-react"
import { format, subDays, subMonths, eachDayOfInterval } from "date-fns"

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

interface AnalysisPageProps {
  habits: Habit[]
  onBack: () => void
}

function AnalysisPage({ habits, onBack }: AnalysisPageProps) {
  const [period, setPeriod] = useState("week")

  const getPeriodData = () => {
    const today = new Date()
    let startDate: Date

    switch (period) {
      case "week":
        startDate = subDays(today, 7)
        break
      case "month":
        startDate = subDays(today, 30)
        break
      case "3months":
        startDate = subMonths(today, 3)
        break
      default:
        startDate = subDays(today, 7)
    }

    const days = eachDayOfInterval({ start: startDate, end: today })

    return days.map((day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      const dayHabits = habits.filter((habit) => {
        if (habit.frequency === "daily") return true
        if (habit.frequency === "weekly" && habit.weekdays) {
          return habit.weekdays.includes(day.getDay())
        }
        return false
      })
      const completed = dayHabits.filter((habit) => habit.completed[dayKey]).length
      const total = dayHabits.length

      return {
        date: day,
        completed,
        total,
        rate: total > 0 ? completed / total : 0,
      }
    })
  }

  const getHabitStats = () => {
    const periodData = getPeriodData()

    return habits.map((habit) => {
      const relevantDays = periodData.filter((day) => {
        if (habit.frequency === "daily") return true
        if (habit.frequency === "weekly" && habit.weekdays) {
          return habit.weekdays.includes(day.date.getDay())
        }
        return false
      })

      const completed = relevantDays.filter((day) => habit.completed[format(day.date, "yyyy-MM-dd")]).length

      const total = relevantDays.length
      const rate = total > 0 ? completed / total : 0

      // Calculate streak
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const checkDate = subDays(today, i)
        const dateKey = format(checkDate, "yyyy-MM-dd")

        const shouldCheck =
          habit.frequency === "daily" || (habit.frequency === "weekly" && habit.weekdays?.includes(checkDate.getDay()))

        if (shouldCheck && habit.completed[dateKey]) {
          streak++
        } else if (shouldCheck) {
          break
        }
      }

      return {
        ...habit,
        completedDays: completed,
        totalDays: total,
        rate: Math.round(rate * 100),
        streak,
      }
    })
  }

  const getWeekdayStats = () => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"]
    const periodData = getPeriodData()

    return weekdays.map((name, index) => {
      const dayData = periodData.filter((day) => day.date.getDay() === index)
      const totalRate = dayData.reduce((sum, day) => sum + day.rate, 0)
      const avgRate = dayData.length > 0 ? totalRate / dayData.length : 0

      return {
        name,
        rate: Math.round(avgRate * 100),
        days: dayData.length,
      }
    })
  }

  const periodData = getPeriodData()
  const habitStats = getHabitStats()
  const weekdayStats = getWeekdayStats()

  const overallRate =
    periodData.length > 0
      ? Math.round((periodData.reduce((sum, day) => sum + day.rate, 0) / periodData.length) * 100)
      : 0

  const lowestHabit = habitStats.reduce(
    (lowest, habit) => (habit.rate < lowest.rate ? habit : lowest),
    habitStats[0] || { rate: 100, name: "" },
  )

  const bestWeekday = weekdayStats.reduce(
    (best, day) => (day.rate > best.rate ? day : best),
    weekdayStats[0] || { rate: 0, name: "" },
  )

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
            <h1 className="text-2xl font-bold text-gray-900">データ分析</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Period Selection */}
        <div className="mb-8">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">今週</SelectItem>
              <SelectItem value="month">今月</SelectItem>
              <SelectItem value="3months">過去3ヶ月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Achievement Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                全体の達成率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-center">{overallRate}%</div>
                <Progress value={overallRate} className="h-3" />
                <p className="text-sm text-gray-600 text-center">平均達成率: {overallRate}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Habit-wise Achievement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                習慣別達成状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habitStats.map((habit) => (
                  <div key={habit.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">連続達成: {habit.streak}日</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={habit.rate} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12">{habit.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekday Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                曜日別達成パターン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekdayStats.map((day) => (
                  <div key={day.name} className="flex items-center gap-4">
                    <div className="w-8 text-center font-medium">{day.name}</div>
                    <div className="flex-1">
                      <Progress value={day.rate} className="h-3" />
                    </div>
                    <div className="w-12 text-sm text-right">{day.rate}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Tips */}
          <Card>
            <CardHeader>
              <CardTitle>改善のためのヒント</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowestHabit && lowestHabit.rate < 80 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm">
                      <strong>最も達成率の低い習慣:</strong> {lowestHabit.name} ({lowestHabit.rate}%)
                      <br />
                      時間帯や方法を見直してみましょう。
                    </p>
                  </div>
                )}

                {bestWeekday && bestWeekday.rate > 70 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm">
                      <strong>達成率の高い曜日:</strong> {bestWeekday.name} ({bestWeekday.rate}%)
                      <br />
                      この曜日に新しい挑戦をするのも良いでしょう。
                    </p>
                  </div>
                )}

                {overallRate > 80 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm">
                      <strong>素晴らしい成果です！</strong>
                      <br />
                      高い達成率を維持できています。新しい習慣を追加してみませんか？
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
