import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string; examId: string; attemptId: string }>
}) {
  const { id, examId, attemptId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single() as any

  if (!subject) {
    redirect('/dashboard')
  }

  // Fetch exam
  const { data: exam } = await supabase
    .from('mock_exams')
    .select('*')
    .eq('id', examId)
    .single() as any

  if (!exam) {
    redirect(`/dashboard/hr-overview/${id}/mock-exams`)
  }

  // Fetch attempt
  const { data: attempt } = await supabase
    .from('mock_exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single() as any

  if (!attempt) {
    redirect(`/dashboard/hr-overview/${id}/mock-exams`)
  }

  const questions = exam.questions
  const userAnswers = attempt.answers || {}

  // Calculate detailed results
  const results = questions.map((question: any) => {
    const userAnswer = userAnswers[question.id]
    let isCorrect = false
    let pointsEarned = 0

    if (question.type === 'multiple_choice') {
      isCorrect = userAnswer === question.correct_answer
      pointsEarned = isCorrect ? question.points : 0
    } else if (question.type === 'true_false') {
      isCorrect = userAnswer === question.correct_answer
      pointsEarned = isCorrect ? question.points : 0
    } else if (question.type === 'short_answer' || question.type === 'essay') {
      // Auto-grade: give points if they attempted
      isCorrect = userAnswer && userAnswer.trim().length > 0
      pointsEarned = isCorrect ? question.points : 0
    }

    return {
      question,
      userAnswer,
      isCorrect,
      pointsEarned,
      wasAttempted: userAnswer !== undefined,
    }
  })

  const correctCount = results.filter((r: any) => r.isCorrect).length
  const attemptedCount = results.filter((r: any) => r.wasAttempted).length
  const scorePercentage = ((attempt.score || 0) / exam.total_points) * 100

  // Group results by topic
  const topicBreakdown = new Map<string, { correct: number; total: number; points: number; maxPoints: number }>()
  results.forEach((result: any) => {
    const topic = result.question.topic
    if (!topicBreakdown.has(topic)) {
      topicBreakdown.set(topic, { correct: 0, total: 0, points: 0, maxPoints: 0 })
    }
    const stats = topicBreakdown.get(topic)!
    stats.total++
    stats.maxPoints += result.question.points
    if (result.isCorrect) {
      stats.correct++
      stats.points += result.pointsEarned
    }
  })

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', message: 'Excellent!' }
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', message: 'Very Good!' }
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', message: 'Good!' }
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600', message: 'Passed' }
    return { grade: 'F', color: 'text-red-600', message: 'Need More Study' }
  }

  const gradeInfo = getGrade(scorePercentage)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exam Results</h1>
          <p className="text-muted-foreground">{exam.title}</p>
        </div>
        <Link href={`/dashboard/hr-overview/${id}/mock-exams`}>
          <Button variant="outline">← Back to Exams</Button>
        </Link>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <div className={`text-7xl font-bold ${gradeInfo.color}`}>
                {attempt.score}/{exam.total_points}
              </div>
              <p className="text-2xl font-semibold mt-2">{scorePercentage.toFixed(1)}%</p>
              <Badge variant={scorePercentage >= 60 ? 'default' : 'destructive'} className="mt-2 text-lg px-4 py-2">
                Grade: {gradeInfo.grade} - {gradeInfo.message}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-6 border-t">
              <div>
                <div className="text-3xl font-bold">{correctCount}/{questions.length}</div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{attemptedCount}/{questions.length}</div>
                <p className="text-sm text-muted-foreground">Attempted</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatTime(attempt.time_taken_seconds || 0)}</div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Topic</CardTitle>
          <CardDescription>See which topics you mastered and which need more study</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(topicBreakdown.entries()).map(([topic, stats]) => {
              const percentage = (stats.correct / stats.total) * 100
              return (
                <div key={topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {stats.points}/{stats.maxPoints} pts
                      </span>
                      <span className="text-sm font-semibold">
                        {stats.correct}/{stats.total} correct ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-blue-500' :
                        percentage >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question by Question Review</CardTitle>
          <CardDescription>Review each question with explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.map((result: any, index: number) => (
            <div
              key={result.question.id}
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect
                  ? 'border-green-500 bg-green-500/10'
                  : !result.wasAttempted
                  ? 'border-gray-400 bg-gray-400/10'
                  : 'border-red-500 bg-red-500/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">Q{index + 1}</span>
                  <Badge variant="outline">{result.question.points} pts</Badge>
                  <Badge variant="secondary">{result.question.topic}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {result.isCorrect ? (
                    <Badge className="bg-green-600">✓ Correct</Badge>
                  ) : !result.wasAttempted ? (
                    <Badge variant="secondary">Not Attempted</Badge>
                  ) : (
                    <Badge variant="destructive">✗ Incorrect</Badge>
                  )}
                  <span className="font-semibold">
                    {result.pointsEarned}/{result.question.points}
                  </span>
                </div>
              </div>

              <p className="font-medium mb-3">{result.question.question}</p>

              {/* Multiple Choice Review */}
              {result.question.type === 'multiple_choice' && result.question.options && (
                <div className="space-y-2">
                  {result.question.options.map((option: string, optIndex: number) => {
                    const isUserAnswer = result.userAnswer === optIndex
                    const isCorrectAnswer = result.question.correct_answer === optIndex
                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded border ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-500/20'
                            : isUserAnswer && !isCorrectAnswer
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && <span className="text-green-600 font-bold">✓</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-red-600 font-bold">✗</span>}
                          <span>{option}</span>
                          {isUserAnswer && <Badge variant="outline" className="ml-auto">Your Answer</Badge>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* True/False Review */}
              {result.question.type === 'true_false' && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Your Answer:</strong>{' '}
                    {result.userAnswer !== undefined ? (result.userAnswer ? 'True' : 'False') : 'Not answered'}
                  </p>
                  <p className="text-sm">
                    <strong>Correct Answer:</strong> {result.question.correct_answer ? 'True' : 'False'}
                  </p>
                </div>
              )}

              {/* Text Answer Review */}
              {(result.question.type === 'short_answer' || result.question.type === 'essay') && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Your Answer:</strong>
                  </p>
                  <div className="p-3 bg-muted rounded">
                    {result.userAnswer || <em className="text-muted-foreground">No answer provided</em>}
                  </div>
                  {result.question.correct_answer && (
                    <>
                      <p className="text-sm">
                        <strong>Sample Answer:</strong>
                      </p>
                      <div className="p-3 bg-green-500/10 border border-green-500 rounded">
                        {result.question.correct_answer}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Explanation */}
              {result.question.explanation && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500 rounded">
                  <p className="text-sm font-semibold mb-1">💡 Explanation:</p>
                  <p className="text-sm">{result.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Link href={`/dashboard/hr-overview/${id}/mock-exams/${examId}`} className="flex-1">
              <Button size="lg" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href={`/dashboard/hr-overview/${id}/mock-exams`} className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Back to All Exams
              </Button>
            </Link>
            <Link href={`/dashboard/study/${id}`} className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Study Flashcards
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
