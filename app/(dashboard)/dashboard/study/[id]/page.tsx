import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudySession from './StudySession'

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch all cards for this subject
  const { data: allCards } = await supabase
    .from('cards')
    .select('*')
    .eq('subject_id', id)
    .eq('user_id', user.id) as any

  if (!allCards || allCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
          <p className="text-muted-foreground">No flashcards available</p>
        </div>
        <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-lg mb-4">
            You haven't created any flashcards for this subject yet.
          </p>
          <p className="text-muted-foreground">
            Create your first flashcards to start learning!
          </p>
        </div>
      </div>
    )
  }

  // Shuffle all cards (Fisher-Yates algorithm)
  const shuffledCards = [...allCards]
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
  }

  const cards = shuffledCards

  return <StudySession subject={subject} cards={cards} userId={user.id} />
}
