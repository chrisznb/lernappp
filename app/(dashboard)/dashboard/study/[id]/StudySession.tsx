'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview, answerToQuality } from '@/lib/spaced-repetition'

interface StudyCard {
  id: string
  front: string
  back: string
  card_type: string
  options: string[] | null
  correct_option: number | null
  tags: string[] | null
}

interface Subject {
  id: string
  name: string
  icon: string | null
}

interface StudySessionProps {
  subject: Subject
  cards: StudyCard[]
  userId: string
}

export default function StudySession({ subject, cards, userId }: StudySessionProps) {
  const router = useRouter()
  const supabase = createClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [reviewedCards, setReviewedCards] = useState<Array<{ id: string; correct: boolean }>>([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex) / cards.length) * 100
  const cardsLeft = cards.length - currentIndex

  const handleAnswer = async (isCorrect: boolean, confidence?: 'easy' | 'good' | 'hard') => {
    // Track this card
    setReviewedCards([...reviewedCards, { id: currentCard.id, correct: isCorrect }])

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    // Save review with spaced repetition
    await saveReview(currentCard.id, isCorrect, confidence)

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
      setSelectedOption(null)
    } else {
      // Session complete
      await completeSession()
    }
  }

  const saveReview = async (cardId: string, isCorrect: boolean, confidence?: 'easy' | 'good' | 'hard') => {
    try {
      // Get previous review data for this card
      const { data: previousReview } = await supabase
        .from('reviews')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .order('reviewed_at', { ascending: false })
        .limit(1)
        .single()

      // Convert answer to quality rating (0-5)
      const quality = answerToQuality(isCorrect, confidence)

      // Calculate next review using SM-2 algorithm
      const reviewData = calculateNextReview(quality, previousReview || undefined)

      // Save new review
      await (supabase.from('reviews').insert as any)({
        user_id: userId,
        card_id: cardId,
        quality: reviewData.quality,
        easiness: reviewData.easiness,
        interval: reviewData.interval,
        repetitions: reviewData.repetitions,
        next_review: reviewData.next_review,
      })
    } catch (error) {
      console.error('Error saving review:', error)
    }
  }

  const completeSession = async () => {
    setIsComplete(true)

    // Calculate XP (2 XP per card, bonus for correct answers)
    const baseXP = cards.length * 2
    const bonusXP = correctCount * 3
    const totalXP = baseXP + bonusXP

    // Save study session
    const duration = Math.ceil((Date.now() - startTime) / 60000) // Actual time in minutes
    const today = new Date().toISOString().split('T')[0]

    await (supabase.from('study_sessions').insert as any)({
      user_id: userId,
      subject_id: subject.id,
      session_date: today,
      duration_minutes: duration,
      cards_reviewed: cards.length,
      cards_correct: correctCount,
      xp_earned: totalXP,
    })

    // Update user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle() as any

    if (stats) {
      const newXP = stats.total_xp + totalXP
      const newLevel = Math.floor(newXP / 100) + 1

      // Calculate streak
      const lastStudyDate = stats.last_study_date ? new Date(stats.last_study_date) : null
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]

      let newStreak = stats.current_streak || 0

      if (!lastStudyDate) {
        // First time studying
        newStreak = 1
      } else if (stats.last_study_date === today) {
        // Already studied today - keep streak
        newStreak = stats.current_streak || 1
      } else if (stats.last_study_date === yesterdayString) {
        // Studied yesterday - continue streak
        newStreak = (stats.current_streak || 0) + 1
      } else {
        // Missed a day - reset streak
        newStreak = 1
      }

      const newLongestStreak = Math.max(stats.longest_streak || 0, newStreak)

      await (supabase
        .from('user_stats')
        .update as any)({
          total_xp: newXP,
          level: newLevel,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_study_date: today,
        })
        .eq('user_id', userId)
    } else {
      // Create initial stats
      await (supabase
        .from('user_stats')
        .insert as any)({
          user_id: userId,
          total_xp: totalXP,
          level: Math.floor(totalXP / 100) + 1,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: today,
        })
    }

    // Update daily goal
    const { data: goal } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', today)
      .single() as any

    if (goal) {
      await (supabase
        .from('daily_goals')
        .update as any)({
          completed_cards: goal.completed_cards + cards.length,
          completed_minutes: goal.completed_minutes + duration,
        })
        .eq('id', goal.id)
    }
  }

  const handleMultipleChoiceAnswer = () => {
    if (selectedOption === null) return

    const isCorrect = selectedOption === currentCard.correct_option
    setShowAnswer(true)

    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleAnswer(isCorrect)
    }, 2000)
  }

  if (isComplete) {
    const accuracy = cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0
    const xpEarned = cards.length * 2 + correctCount * 3

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-3xl font-bold">{cards.length}</div>
                <div className="text-sm text-muted-foreground">Cards</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-3xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
              <div className="text-4xl font-bold text-primary">+{xpEarned} XP</div>
              <div className="text-sm text-muted-foreground mt-1">Earned</div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {subject.icon && <span>{subject.icon}</span>}
              {subject.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {cardsLeft} {cardsLeft === 1 ? 'Karte' : 'Karten'} übrig
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Richtig</div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Card Type */}
          {currentCard.card_type === 'basic' && (
            <>
              <div className="bg-muted/50 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center gap-4">
                {!isFlipped ? (
                  <p className="text-xl text-center whitespace-pre-wrap">
                    {currentCard.front}
                  </p>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Frage:</p>
                      <p className="text-lg whitespace-pre-wrap">{currentCard.front}</p>
                    </div>
                    <div className="w-full border-t border-border my-2"></div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Antwort:</p>
                      <p className="text-xl font-semibold whitespace-pre-wrap">{currentCard.back}</p>
                    </div>
                  </>
                )}
              </div>

              {!isFlipped ? (
                <Button
                  onClick={() => setIsFlipped(true)}
                  className="w-full"
                  size="lg"
                >
                  Antwort zeigen
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    size="lg"
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    🔁 Nochmal wiederholen
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true, 'easy')}
                    variant="outline"
                    size="lg"
                    className="border-green-200 hover:bg-green-50"
                  >
                    ✅ Das war easy
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Multiple Choice Type */}
          {currentCard.card_type === 'multiple_choice' && currentCard.options && (
            <>
              <div className="bg-muted/50 rounded-lg p-8">
                <p className="text-xl mb-6 whitespace-pre-wrap">{currentCard.front}</p>
                <div className="space-y-3">
                  {currentCard.options.map((option, index) => {
                    const isSelected = selectedOption === index
                    const isCorrectOption = index === currentCard.correct_option
                    const showResult = showAnswer

                    return (
                      <button
                        key={index}
                        onClick={() => !showAnswer && setSelectedOption(index)}
                        disabled={showAnswer}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showResult
                            ? isCorrectOption
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              showResult
                                ? isCorrectOption
                                  ? 'border-green-500 bg-green-500'
                                  : isSelected
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-gray-300'
                                : isSelected
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                            }`}
                          >
                            {showResult && isCorrectOption && (
                              <span className="text-white text-sm">✓</span>
                            )}
                            {showResult && isSelected && !isCorrectOption && (
                              <span className="text-white text-sm">✗</span>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {!showAnswer && (
                <Button
                  onClick={handleMultipleChoiceAnswer}
                  disabled={selectedOption === null}
                  className="w-full"
                  size="lg"
                >
                  Antwort prüfen
                </Button>
              )}
            </>
          )}

          {/* Cloze (Fill in the blank) Type */}
          {currentCard.card_type === 'cloze' && (
            <>
              <div className="bg-muted/50 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center gap-4">
                {!isFlipped ? (
                  <p className="text-xl text-center whitespace-pre-wrap">
                    {currentCard.front}
                  </p>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Frage:</p>
                      <p className="text-lg whitespace-pre-wrap">{currentCard.front}</p>
                    </div>
                    <div className="w-full border-t border-border my-2"></div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Antwort:</p>
                      <p className="text-xl font-semibold whitespace-pre-wrap">{currentCard.back}</p>
                    </div>
                  </>
                )}
              </div>

              {!isFlipped ? (
                <Button
                  onClick={() => setIsFlipped(true)}
                  className="w-full"
                  size="lg"
                >
                  Lösung zeigen
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    size="lg"
                    className="border-orange-200 hover:bg-orange-50"
                  >
                    🔁 Nochmal wiederholen
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true, 'easy')}
                    variant="outline"
                    size="lg"
                    className="border-green-200 hover:bg-green-50"
                  >
                    ✅ Das war easy
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Abbrechen
        </Button>
        <div className="text-sm text-muted-foreground">
          Session wird automatisch gespeichert
        </div>
      </div>
    </div>
  )
}
