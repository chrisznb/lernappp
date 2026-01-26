import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function HROverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Fetch card statistics
  const { data: allCards } = await supabase
    .from('cards')
    .select('*')
    .eq('subject_id', id)
    .eq('user_id', user.id) as any

  const totalCards = allCards?.length || 0
  const basicCards = allCards?.filter((c: any) => c.card_type === 'basic').length || 0
  const mcCards = allCards?.filter((c: any) => c.card_type === 'multiple_choice').length || 0

  // Extract unique tags for topic count
  const allTags = new Set<string>()
  allCards?.forEach((card: any) => {
    card.tags?.forEach((tag: string) => {
      if (tag !== 'hr' && tag !== 'exam') {
        allTags.add(tag)
      }
    })
  })
  const topicCount = allTags.size

  // Calculate exam date info
  const examDate = new Date(subject.exam_date)
  const daysLeft = Math.ceil(
    (examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-6xl">{subject.icon}</span>
          <div>
            <h1 className="text-4xl font-bold">{subject.name}</h1>
            <p className="text-muted-foreground text-lg">
              Choose your learning method
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            📚 {totalCards} Cards Total
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2">
            🏷️ {topicCount} Topics
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2">
            ✍️ {basicCards} Flashcards
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2">
            ❓ {mcCards} Multiple Choice
          </Badge>
          <Badge
            variant={daysLeft <= 7 ? "destructive" : daysLeft <= 14 ? "default" : "secondary"}
            className="text-base px-4 py-2"
          >
            📅 {daysLeft} Days until Exam
          </Badge>
        </div>
      </div>

      {/* 4 Main Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Flashcards */}
        <Card className="hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📚</span>
              <Badge variant="secondary">{totalCards} cards</Badge>
            </div>
            <CardTitle className="text-2xl">Study Flashcards</CardTitle>
            <CardDescription className="text-base">
              Learn with spaced repetition. Review {basicCards} flashcards and {mcCards} multiple-choice questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/study/${id}`}>
              <Button size="lg" className="w-full group-hover:bg-primary/90">
                Start Learning Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Study Guide Viewer */}
        <Card className="hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📖</span>
              <Badge variant="secondary">70+ pages</Badge>
            </div>
            <CardTitle className="text-2xl">Study Guide</CardTitle>
            <CardDescription className="text-base">
              Comprehensive study materials with all exam topics, examples, and a 2-day study plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/hr-overview/${id}/study-guide`}>
              <Button size="lg" className="w-full group-hover:bg-accent" variant="outline">
                View Study Guide
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Learning Matrix */}
        <Card className="hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📊</span>
              <Badge variant="secondary">{topicCount} topics</Badge>
            </div>
            <CardTitle className="text-2xl">Learning Matrix</CardTitle>
            <CardDescription className="text-base">
              Topic overview with priorities, exam points, and progress tracking for strategic learning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/hr-overview/${id}/matrix`}>
              <Button size="lg" className="w-full group-hover:bg-accent" variant="outline">
                View Learning Matrix
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mock Exams */}
        <Card className="hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">🎯</span>
              <Badge variant="secondary">3 exams</Badge>
            </div>
            <CardTitle className="text-2xl">Mock Exams</CardTitle>
            <CardDescription className="text-base">
              Test your knowledge with realistic exam simulations. Timed questions with detailed feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/hr-overview/${id}/mock-exams`}>
              <Button size="lg" className="w-full group-hover:bg-accent" variant="outline">
                Start Mock Exam
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Exam Preparation Tips */}
      <Card className="bg-muted/50 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            Exam Preparation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Strategy:</strong> Focus on HIGH PRIORITY topics first (Kotter's 8 Steps, Organization Archetypes, Gender Equality) as they make up ~80% of exam points.
          </p>
          <p className="text-sm">
            <strong>Practice:</strong> Use flashcards for memorization, study guide for deep understanding, and mock exams to test yourself under exam conditions.
          </p>
          <p className="text-sm text-muted-foreground">
            The exam consists of 18 tasks worth 80 points total. Master high-priority topics to maximize your score.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
