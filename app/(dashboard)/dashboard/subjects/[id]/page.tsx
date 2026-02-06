import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SubjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch the subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single() as any

  if (!subject) return null

  // If subject has no children, redirect to study
  const { data: children } = await supabase
    .from('subjects')
    .select('*')
    .eq('parent_subject_id', params.id)
    .order('name', { ascending: true }) as any

  if (!children || children.length === 0) {
    redirect(`/dashboard/study/${params.id}`)
  }

  // Fetch card counts for each child
  const childrenWithCardCounts = await Promise.all(
    children.map(async (child: any) => {
      const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', child.id)
        .eq('user_id', user.id) as any

      return {
        ...child,
        cardCount: count || 0,
      }
    })
  )

  const examDate = new Date(subject.exam_date)
  const today = new Date()
  const daysLeft = Math.ceil(
    (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
        <p className="text-muted-foreground">
          {daysLeft > 0 ? `Klausur in ${daysLeft} Tagen` : 'Klausur ist heute!'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenWithCardCounts.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="text-4xl">{child.icon || '📚'}</span>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {child.name}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Count */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Karteikarten:</span>
                  <span className="font-bold text-lg">{child.cardCount}</span>
                </div>
              </div>

              {/* Action Button */}
              <Link href={`/dashboard/study/${child.id}`} className="block">
                <Button className="w-full">Lernen</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
