import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SubjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Check if user is admin
  const isAdmin = user.email === 'christian@zaunbrecher.com'

  // Fetch all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('exam_date', { ascending: true }) as any

  // Fetch card counts for each subject
  const subjectsWithCardCounts = await Promise.all(
    (subjects || []).map(async (subject: any) => {
      const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', subject.id)
        .eq('user_id', user.id) as any

      return {
        ...subject,
        cardCount: count || 0,
      }
    })
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alle Fächer</h1>
        <p className="text-muted-foreground">
          Übersicht über deine 6 Klausuren
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsWithCardCounts.map((subject) => {
          const examDate = new Date(subject.exam_date)
          const today = new Date()
          const daysLeft = Math.ceil(
            (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )
          const isPriority = daysLeft <= 30
          const isUpcoming = daysLeft <= 7

          return (
            <Card
              key={subject.id}
              className={`hover:shadow-lg transition-shadow ${
                isUpcoming ? 'border-2 border-destructive' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-4xl">{subject.icon}</span>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {subject.name}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exam Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Klausur:</span>
                    <span className="font-medium">
                      {examDate.toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        isUpcoming
                          ? 'destructive'
                          : isPriority
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {daysLeft > 0 ? `${daysLeft} Tage` : 'Heute!'}
                    </Badge>
                  </div>
                </div>

                {/* Card Count */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Karteikarten:</span>
                    <span className="font-bold text-lg">
                      {subject.cardCount}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <Link href={`/dashboard/study/${subject.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      Learn
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href={`/dashboard/subjects/${subject.id}/manage`} className="flex-1">
                      <Button className="w-full" variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
