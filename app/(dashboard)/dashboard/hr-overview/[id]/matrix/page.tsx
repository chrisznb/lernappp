import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LearningMatrix from './LearningMatrix'

// Topic priorities and exam weights based on the study plan
const TOPIC_CONFIG: Record<string, { priority: 'HIGH' | 'MEDIUM' | 'LOW'; examPoints: number; displayName: string }> = {
  'change-management': { priority: 'HIGH', examPoints: 30, displayName: "Kotter's 8 Steps" },
  'kotter': { priority: 'HIGH', examPoints: 30, displayName: "Kotter's Change Management" },
  'organizational-structure': { priority: 'HIGH', examPoints: 25, displayName: 'Organization Archetypes' },
  'archetypes': { priority: 'HIGH', examPoints: 25, displayName: 'Organization Archetypes' },
  'gender-equality': { priority: 'HIGH', examPoints: 25, displayName: 'Gender Equality & Diversity' },
  'diversity': { priority: 'HIGH', examPoints: 25, displayName: 'Gender Equality & Diversity' },
  'personnel-planning': { priority: 'MEDIUM', examPoints: 15, displayName: 'Personnel Planning' },
  'workforce': { priority: 'MEDIUM', examPoints: 15, displayName: 'Personnel Planning' },
  'leadership': { priority: 'MEDIUM', examPoints: 15, displayName: 'Leadership Models' },
  'leadership-models': { priority: 'MEDIUM', examPoints: 15, displayName: 'Leadership Styles & Models' },
  'span-of-control': { priority: 'MEDIUM', examPoints: 10, displayName: 'Span of Control' },
  'cognitive-biases': { priority: 'LOW', examPoints: 5, displayName: 'Cognitive Biases' },
  'decision-making': { priority: 'LOW', examPoints: 5, displayName: 'Decision Making' },
  'reiss-profile': { priority: 'LOW', examPoints: 5, displayName: 'Reiss Motivation Profile' },
  'motivation': { priority: 'LOW', examPoints: 5, displayName: 'Motivation Theory' },
  'cross-cultural': { priority: 'LOW', examPoints: 5, displayName: 'Cross-Cultural Management' },
  'culture': { priority: 'LOW', examPoints: 5, displayName: 'Organizational Culture' },
  'teamwork': { priority: 'LOW', examPoints: 5, displayName: 'Teamwork & Collaboration' },
  'team-dynamics': { priority: 'LOW', examPoints: 5, displayName: 'Team Dynamics' },
  'organizational-theory': { priority: 'LOW', examPoints: 5, displayName: 'Organizational Theory' },
  'personnel-selection': { priority: 'LOW', examPoints: 5, displayName: 'Personnel Selection' },
  'recruitment': { priority: 'LOW', examPoints: 5, displayName: 'Recruitment & Selection' },
  'employer-branding': { priority: 'LOW', examPoints: 5, displayName: 'Employer Branding' },
}

export default async function MatrixPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Group cards by topics
  const topicMap = new Map<string, any[]>()

  allCards?.forEach((card: any) => {
    card.tags?.forEach((tag: string) => {
      // Skip generic tags
      if (tag === 'hr' || tag === 'exam') return

      if (!topicMap.has(tag)) {
        topicMap.set(tag, [])
      }
      topicMap.get(tag)!.push(card)
    })
  })

  // Build topic data
  const topics = Array.from(topicMap.entries()).map(([tag, cards]) => {
    const config = TOPIC_CONFIG[tag] || {
      priority: 'LOW' as const,
      examPoints: 5,
      displayName: tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }

    return {
      tag,
      displayName: config.displayName,
      priority: config.priority,
      examPoints: config.examPoints,
      cardCount: cards.length,
      cards: cards,
    }
  })

  // Sort by priority (HIGH > MEDIUM > LOW), then by exam points
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  topics.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.examPoints - a.examPoints
  })

  return (
    <LearningMatrix
      subject={subject}
      topics={topics}
      subjectId={id}
    />
  )
}
