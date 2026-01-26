import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExamInterface from './ExamInterface'

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>
}) {
  const { id, examId } = await params
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

  // Check for existing in-progress attempt
  const { data: existingAttempt } = await supabase
    .from('mock_exam_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('exam_id', examId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any

  return (
    <ExamInterface
      subject={subject}
      exam={exam}
      existingAttempt={existingAttempt}
      userId={user.id}
      subjectId={id}
    />
  )
}
