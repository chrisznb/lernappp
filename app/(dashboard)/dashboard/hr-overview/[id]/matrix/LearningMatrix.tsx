'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Topic {
  tag: string
  displayName: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  examPoints: number
  cardCount: number
  cards: any[]
}

interface LearningMatrixProps {
  subject: any
  topics: Topic[]
  subjectId: string
}

type SortField = 'displayName' | 'priority' | 'examPoints' | 'cardCount'
type SortDirection = 'asc' | 'desc'

export default function LearningMatrix({ subject, topics, subjectId }: LearningMatrixProps) {
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter topics
  const filteredTopics = useMemo(() => {
    if (filterPriority === 'ALL') return topics
    return topics.filter(topic => topic.priority === filterPriority)
  }, [topics, filterPriority])

  // Sort topics
  const sortedTopics = useMemo(() => {
    const sorted = [...filteredTopics]

    sorted.sort((a, b) => {
      let comparison = 0

      if (sortField === 'priority') {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortField === 'displayName') {
        comparison = a.displayName.localeCompare(b.displayName)
      } else {
        comparison = a[sortField] - b[sortField]
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredTopics, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Priority badge styling
  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const variants = {
      HIGH: 'destructive',
      MEDIUM: 'default',
      LOW: 'secondary',
    } as const

    return (
      <Badge variant={variants[priority]} className="font-semibold">
        {priority}
      </Badge>
    )
  }

  // Calculate total stats
  const totalCards = topics.reduce((sum, t) => sum + t.cardCount, 0)
  const highPriorityCards = topics.filter(t => t.priority === 'HIGH').reduce((sum, t) => sum + t.cardCount, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/hr-overview/${subjectId}`}>
            <Button variant="outline">← Back to Overview</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subject.name} - Learning Matrix</h1>
            <p className="text-muted-foreground">Strategic overview of all exam topics</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCards}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highPriorityCards}</div>
            <p className="text-xs text-muted-foreground mt-1">cards to focus on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground mt-1">exam topics covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filterPriority === priority ? 'default' : 'outline'}
                onClick={() => setFilterPriority(priority)}
                size="sm"
              >
                {priority}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Topics Overview</CardTitle>
          <CardDescription>
            Click column headers to sort. Focus on HIGH priority topics first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSort('displayName')}
                  >
                    Topic {sortField === 'displayName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSort('examPoints')}
                  >
                    Exam Points {sortField === 'examPoints' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSort('cardCount')}
                  >
                    Cards {sortField === 'cardCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTopics.map((topic) => (
                  <tr
                    key={topic.tag}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{topic.displayName}</td>
                    <td className="py-3 px-4">{getPriorityBadge(topic.priority)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{topic.examPoints}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{topic.cardCount} cards</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/study/${subjectId}`}>
                        <Button size="sm" variant="ghost">
                          Study →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedTopics.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No topics found for the selected filter.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Recommendation */}
      <Card className="bg-muted/50 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📌</span>
            Study Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Priority Strategy:</strong> The table shows topics ranked by their importance for the exam.
          </p>
          <p className="text-sm">
            <strong>HIGH priority</strong> topics make up ~80% of exam points. Master these first!
          </p>
          <p className="text-sm">
            <strong>MEDIUM priority</strong> topics provide additional coverage. Study these after HIGH.
          </p>
          <p className="text-sm">
            <strong>LOW priority</strong> topics are useful but less critical. Review these if time permits.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
