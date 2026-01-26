'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface StudyGuideViewerProps {
  subject: any
  markdownContent: string
  subjectId: string
}

interface TocItem {
  id: string
  level: number
  text: string
}

export default function StudyGuideViewer({
  subject,
  markdownContent,
  subjectId,
}: StudyGuideViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<string>('')

  // Extract table of contents from markdown
  const toc = useMemo(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const items: TocItem[] = []
    let match

    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      items.push({ id, level, text })
    }

    return items
  }, [markdownContent])

  // Filter markdown content based on search
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return markdownContent

    const lines = markdownContent.split('\n')
    const filtered: string[] = []
    let inRelevantSection = false
    let currentSection: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isHeading = /^#{1,3}\s/.test(line)

      if (isHeading) {
        // Save previous section if it was relevant
        if (inRelevantSection && currentSection.length > 0) {
          filtered.push(...currentSection)
          filtered.push('') // Add spacing
        }
        currentSection = [line]
        inRelevantSection = false
      } else {
        currentSection.push(line)
      }

      // Check if line matches search query
      if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
        inRelevantSection = true
      }
    }

    // Don't forget the last section
    if (inRelevantSection && currentSection.length > 0) {
      filtered.push(...currentSection)
    }

    return filtered.length > 0 ? filtered.join('\n') : '## No results found\n\nTry a different search term.'
  }, [markdownContent, searchQuery])

  // Handle section click
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  // Add IDs to headings for scrolling
  const MarkdownComponents = {
    h1: ({ children, ...props }: any) => {
      const text = children?.toString() || ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return (
        <h1 id={id} className="text-3xl font-bold mt-8 mb-4 scroll-mt-20" {...props}>
          {children}
        </h1>
      )
    },
    h2: ({ children, ...props }: any) => {
      const text = children?.toString() || ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return (
        <h2 id={id} className="text-2xl font-bold mt-6 mb-3 scroll-mt-20" {...props}>
          {children}
        </h2>
      )
    },
    h3: ({ children, ...props }: any) => {
      const text = children?.toString() || ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      return (
        <h3 id={id} className="text-xl font-semibold mt-4 mb-2 scroll-mt-20" {...props}>
          {children}
        </h3>
      )
    },
    p: ({ children, ...props }: any) => (
      <p className="mb-4 leading-7" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-foreground" {...props}>
        {children}
      </strong>
    ),
    code: ({ children, ...props }: any) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }: any) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props}>
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props}>
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/hr-overview/${subjectId}`}>
            <Button variant="outline">← Back to Overview</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subject.name} - Study Guide</h1>
            <p className="text-muted-foreground">Comprehensive exam preparation materials</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search topics, keywords, formulas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <nav className="space-y-1">
                {toc.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-accent transition-colors
                      ${item.level === 1 ? 'font-semibold' : ''}
                      ${item.level === 2 ? 'pl-4' : ''}
                      ${item.level === 3 ? 'pl-6 text-muted-foreground' : ''}
                      ${activeSection === item.id ? 'bg-accent' : ''}
                    `}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Markdown Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {filteredContent}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Button - Fixed Bottom */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => window.print()}
          className="shadow-lg"
        >
          🖨️ Print Study Guide
        </Button>
      </div>
    </div>
  )
}
