'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  points: number
  topic: string
  question: string
  options?: string[]
  correct_answer?: number | string | boolean
  explanation?: string
}

interface ExamInterfaceProps {
  subject: any
  exam: any
  existingAttempt: any
  userId: string
  subjectId: string
}

export default function ExamInterface({
  subject,
  exam,
  existingAttempt,
  userId,
  subjectId,
}: ExamInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()

  const questions: Question[] = exam.questions
  const [attemptId, setAttemptId] = useState<string | null>(existingAttempt?.id || null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>(
    existingAttempt?.answers || {}
  )
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // Start exam automatically if no existing attempt
  useEffect(() => {
    if (!attemptId) {
      startNewAttempt()
    }
  }, [])

  // Timer
  useEffect(() => {
    const startTime = existingAttempt?.started_at
      ? new Date(existingAttempt.started_at).getTime()
      : Date.now()

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [existingAttempt])

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (!attemptId) return

    const interval = setInterval(() => {
      saveProgress()
    }, 30000)

    return () => clearInterval(interval)
  }, [attemptId, answers])

  const startNewAttempt = async () => {
    const { data, error } = await (supabase
      .from('mock_exam_attempts')
      .insert as any)({
        user_id: userId,
        exam_id: exam.id,
        answers: {},
        status: 'in_progress',
        max_score: exam.total_points,
      })
      .select()
      .single()

    if (data && !error) {
      setAttemptId(data.id)
    }
  }

  const saveProgress = async () => {
    if (!attemptId) return

    await (supabase
      .from('mock_exam_attempts')
      .update as any)({
        answers,
        time_taken_seconds: timeElapsed,
      })
      .eq('id', attemptId)
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const calculateScore = () => {
    let score = 0
    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer === undefined) return

      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correct_answer) {
          score += question.points
        }
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correct_answer) {
          score += question.points
        }
      }
      // For short_answer and essay, manual grading would be needed
      // For now, we'll give points if they attempted an answer
      else if (question.type === 'short_answer' || question.type === 'essay') {
        if (userAnswer && userAnswer.trim().length > 0) {
          score += question.points // Auto-give points for attempting
        }
      }
    })
    return score
  }

  const handleSubmit = async () => {
    if (!attemptId) return

    setIsSubmitting(true)

    const score = calculateScore()

    await (supabase
      .from('mock_exam_attempts')
      .update as any)({
        answers,
        score,
        time_taken_seconds: timeElapsed,
        completed_at: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', attemptId)

    router.push(
      `/dashboard/hr-overview/${subjectId}/mock-exams/${exam.id}/results/${attemptId}`
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / questions.length) * 100

  if (!attemptId) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-lg">Starting exam...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Timer */}
      <Card className="sticky top-0 z-10 shadow-lg">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                <p className="text-xs text-muted-foreground">Time Elapsed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {answeredCount}/{questions.length}
                </div>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm transition-all
                      ${currentQuestionIndex === index ? 'bg-primary text-primary-foreground' : ''}
                      ${answers[q.id] !== undefined && currentQuestionIndex !== index
                        ? 'bg-green-500 text-white'
                        : ''
                      }
                      ${answers[q.id] === undefined && currentQuestionIndex !== index
                        ? 'bg-muted hover:bg-muted/80'
                        : ''
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                    </Badge>
                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                  </div>
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multiple Choice */}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestion.id, index)}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${answers[currentQuestion.id] === index
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${answers[currentQuestion.id] === index
                            ? 'border-primary bg-primary'
                            : 'border-border'
                          }
                        `}
                        >
                          {answers[currentQuestion.id] === index && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  {[true, false].map((value) => (
                    <button
                      key={value.toString()}
                      onClick={() => handleAnswer(currentQuestion.id, value)}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${answers[currentQuestion.id] === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${answers[currentQuestion.id] === value
                            ? 'border-primary bg-primary'
                            : 'border-border'
                          }
                        `}
                        >
                          {answers[currentQuestion.id] === value && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="flex-1 font-semibold">{value ? 'True' : 'False'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion.type === 'short_answer' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 rounded-lg border-2 border-border focus:border-primary outline-none"
                />
              )}

              {/* Essay */}
              {currentQuestion.type === 'essay' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Write your answer here..."
                  rows={8}
                  className="w-full p-4 rounded-lg border-2 border-border focus:border-primary outline-none resize-none"
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </Button>

                <Button onClick={saveProgress} variant="ghost">
                  💾 Save Progress
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowConfirmSubmit(true)}
                    size="lg"
                    className="font-bold"
                  >
                    Submit Exam →
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have answered <strong>{answeredCount} out of {questions.length}</strong> questions.
              </p>
              <p className="text-sm text-muted-foreground">
                Unanswered questions will be marked as incorrect. Are you sure you want to submit?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
