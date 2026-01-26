import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function MockExamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch subject and verify ownership
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as any

  if (!subject) {
    redirect('/dashboard')
  }

  // Fetch all mock exams for this subject (RLS will allow since user owns the subject)
  const { data: exams } = await supabase
    .from('mock_exams')
    .select('*')
    .eq('subject_id', id)
    .order('created_at', { ascending: true }) as any

  // Fetch user's attempts for these exams
  const { data: attempts } = await supabase
    .from('mock_exam_attempts')
    .select('*')
    .eq('user_id', user.id)
    .in('exam_id', exams?.map((e: any) => e.id) || [])
    .order('started_at', { ascending: false }) as any

  // Map attempts to exams
  const examsWithAttempts = exams?.map((exam: any) => {
    const examAttempts = attempts?.filter((a: any) => a.exam_id === exam.id) || []
    const completedAttempts = examAttempts.filter((a: any) => a.status === 'completed')
    const bestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a: any) => a.score || 0))
      : null
    const lastAttempt = examAttempts[0]

    return {
      ...exam,
      attemptCount: completedAttempts.length,
      bestScore,
      lastAttempt,
      hasInProgress: lastAttempt?.status === 'in_progress',
    }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/hr-overview/${id}`}>
            <Button variant="outline">← Back to Overview</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subject.name} - Mock Exams</h1>
            <p className="text-muted-foreground">Test your knowledge with realistic exam simulations</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            Mock Exam Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Purpose:</strong> These mock exams simulate the real exam format and difficulty.
          </p>
          <p className="text-sm">
            <strong>Strategy:</strong> Take Mock Exam 1 first to identify weak areas, then study those topics before attempting Exam 2.
          </p>
          <p className="text-sm">
            <strong>Timing:</strong> Try to complete each exam within the time limit to practice time management.
          </p>
          <p className="text-sm">
            <strong>Scoring:</strong> Review your results carefully and understand why answers were correct or incorrect.
          </p>
        </CardContent>
      </Card>

      {/* Exams List */}
      {(!examsWithAttempts || examsWithAttempts.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg mb-4">No mock exams available yet.</p>
            <p className="text-muted-foreground">
              Mock exams will be added soon. Check back later!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {examsWithAttempts?.map((exam: any) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{exam.title}</CardTitle>
                  <CardDescription className="text-base">
                    {exam.description}
                  </CardDescription>
                </div>
                {exam.hasInProgress && (
                  <Badge variant="default" className="ml-4">
                    In Progress
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Exam Stats */}
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="text-base px-4 py-2">
                  📊 {exam.total_points} Points
                </Badge>
                {exam.time_limit_minutes && (
                  <Badge variant="outline" className="text-base px-4 py-2">
                    ⏱️ {exam.time_limit_minutes} Minutes
                  </Badge>
                )}
                <Badge variant="outline" className="text-base px-4 py-2">
                  ❓ {exam.questions.length} Questions
                </Badge>
                {exam.attemptCount > 0 && (
                  <Badge variant="outline" className="text-base px-4 py-2">
                    ✅ {exam.attemptCount} Attempt{exam.attemptCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Best Score */}
              {exam.bestScore !== null && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Best Score</span>
                    <span className="text-2xl font-bold">
                      {exam.bestScore}/{exam.total_points}
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(exam.bestScore / exam.total_points) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {exam.hasInProgress ? (
                  <Link href={`/dashboard/hr-overview/${id}/mock-exams/${exam.id}`} className="flex-1">
                    <Button size="lg" className="w-full">
                      Continue Exam
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboard/hr-overview/${id}/mock-exams/${exam.id}`} className="flex-1">
                    <Button size="lg" className="w-full">
                      {exam.attemptCount > 0 ? 'Start New Attempt' : 'Start Exam'}
                    </Button>
                  </Link>
                )}

                {exam.lastAttempt?.status === 'completed' && (
                  <Link href={`/dashboard/hr-overview/${id}/mock-exams/${exam.id}/results/${exam.lastAttempt.id}`}>
                    <Button size="lg" variant="outline">
                      View Last Results
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
