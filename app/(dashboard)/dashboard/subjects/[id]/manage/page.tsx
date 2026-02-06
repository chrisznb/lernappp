import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CardManager from './CardManager'

export default async function ManageCardsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch subject (RLS ensures user can only access their own subjects)
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!subject) {
    redirect('/dashboard/subjects')
  }

  // Check if subject has children
  const { data: children } = await supabase
    .from('subjects')
    .select('id')
    .eq('parent_subject_id', id) as any

  let cards

  if (children && children.length > 0) {
    // This is a parent subject, fetch cards from all children
    const childIds = children.map((c: any) => c.id)
    const result = await supabase
      .from('cards')
      .select('*')
      .in('subject_id', childIds)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as any

    cards = result.data
  } else {
    // This is a leaf subject, fetch cards directly
    const result = await supabase
      .from('cards')
      .select('*')
      .eq('subject_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as any

    cards = result.data
  }

  return <CardManager subject={subject} initialCards={cards || []} userId={user.id} />
}
