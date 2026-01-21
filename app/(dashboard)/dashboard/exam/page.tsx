'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

interface Question {
  id: string
  front: string
  options: string[]
  correct_option: number
  subject_id: string
}

interface Result {
  correct: number
  total: number
  percentage: number
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadRandomQuestions()
  }, [])

  async function loadRandomQuestions() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Hole 20 zufällige Multiple-Choice-Karten aus allen Fächern
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, front, options, correct_option, subject_id')
      .eq('user_id', user.id)
      .eq('card_type', 'multiple_choice')
      .order('id', { ascending: false }) // Random order via different approach

    if (error) {
      console.error('Error loading questions:', error)
      return
    }

    if (cards) {
      // Shuffle und nimm die ersten 20
      const shuffled = cards.sort(() => Math.random() - 0.5).slice(0, 20)
      setQuestions(shuffled.map(card => ({
        ...card,
        options: JSON.parse(card.options as string)
      })))
    }

    setLoading(false)
  }

  function handleAnswerSelect(optionIndex: number) {
    setSelectedAnswer(optionIndex)
  }

  function handleNext() {
    if (selectedAnswer === null) return

    // Speichere Antwort
    setAnswers({ ...answers, [currentIndex]: selectedAnswer })

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(answers[currentIndex + 1] ?? null)
    } else {
      // Zeige Ergebnis
      calculateResult()
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[currentIndex - 1] ?? null)
    }
  }

  function calculateResult() {
    let correct = 0
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_option) {
        correct++
      }
    })

    const percentage = Math.round((correct / questions.length) * 100)
    setResult({ correct, total: questions.length, percentage })
    setShowResult(true)
  }

  function restartExam() {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswers({})
    setShowResult(false)
    setResult(null)
    loadRandomQuestions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Prüfungsfragen...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Keine Fragen verfügbar</h2>
        <p className="text-muted-foreground mb-4">
          Du benötigst mindestens 20 Karteikarten, um einen Test zu starten.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Zurück zum Dashboard
        </Button>
      </div>
    )
  }

  if (showResult && result) {
    const passed = result.percentage >= 50

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {passed ? '🎉 Bestanden!' : '📚 Nicht Bestanden'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {result.percentage}%
              </div>
              <p className="text-muted-foreground">
                {result.correct} von {result.total} Fragen richtig
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {result.correct}
                    </div>
                    <p className="text-sm text-muted-foreground">Richtig</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {result.total - result.correct}
                    </div>
                    <p className="text-sm text-muted-foreground">Falsch</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button onClick={restartExam} className="flex-1">
                  Nochmal versuchen
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Zurück zum Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Frage {currentIndex + 1} von {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.front}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          Zurück
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="flex-1"
        >
          {currentIndex === questions.length - 1 ? 'Ergebnis anzeigen' : 'Weiter'}
        </Button>
      </div>
    </div>
  )
}
