import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user stats
  let { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() as any

  // Auto-create user stats if they don't exist
  if (!stats) {
    const { data: newStats } = await (supabase
      .from('user_stats')
      .insert as any)({
        user_id: user.id,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null,
      })
      .select()
      .single()
    stats = newStats
  }

  // Fetch all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('exam_date', { ascending: true }) as any

  // Fetch today's goal
  const today = new Date().toISOString().split('T')[0]
  let { data: todayGoal, error: goalError } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('goal_date', today)
    .maybeSingle() as any

  // Auto-create daily goal if it doesn't exist
  if (!todayGoal || goalError) {
    const { data: newGoal } = await (supabase
      .from('daily_goals')
      .insert as any)({
        user_id: user.id,
        goal_date: today,
        target_cards: 50,
        target_minutes: 120,
        completed_cards: 0,
        completed_minutes: 0,
      })
      .select()
      .maybeSingle()
    todayGoal = newGoal
  }

  // Calculate days until next exam
  const nextExam = subjects?.[0]
  const daysUntilExam = nextExam
    ? Math.ceil(
        (new Date(nextExam.exam_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-muted-foreground">
          Bereit für deine nächste Lernsession?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.level || 1}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_xp || 0} XP Gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.current_streak || 0} Tage
            </div>
            <p className="text-xs text-muted-foreground">
              Längster: {stats?.longest_streak || 0} Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nächste Klausur</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilExam !== null ? `${daysUntilExam} Tage` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextExam?.name || 'Keine Klausur'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Deine Fächer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects?.map((subject: any) => {
            const examDate = new Date(subject.exam_date)
            const daysLeft = Math.ceil(
              (examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            const isPriority = daysLeft <= 30

            return (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{subject.icon}</span>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Klausur:</span>
                    <span className="font-medium">
                      {examDate.toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={isPriority ? 'destructive' : 'secondary'}
                    >
                      {daysLeft} Tage
                    </Badge>
                    <Link href={`/dashboard/study/${subject.id}`}>
                      <Button size="sm">Lernen</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tägliches Ziel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Karten</span>
              <span>
                {todayGoal?.completed_cards || 0} / {todayGoal?.target_cards || 50}
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    ((todayGoal?.completed_cards || 0) /
                      (todayGoal?.target_cards || 50)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Minuten</span>
              <span>
                {todayGoal?.completed_minutes || 0} /{' '}
                {todayGoal?.target_minutes || 120}
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    ((todayGoal?.completed_minutes || 0) /
                      (todayGoal?.target_minutes || 120)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
