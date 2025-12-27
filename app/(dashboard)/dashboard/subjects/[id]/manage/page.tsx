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

  // Only allow admin to manage cards
  if (user.email !== 'christian@zaunbrecher.com') {
    redirect('/dashboard/subjects')
  }

  // Fetch subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single()

  if (!subject) {
    redirect('/dashboard/subjects')
  }

  // Fetch all cards for this subject
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('subject_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <CardManager subject={subject} initialCards={cards || []} userId={user.id} />
}
