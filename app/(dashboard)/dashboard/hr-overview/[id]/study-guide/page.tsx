import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'
import StudyGuideViewer from './StudyGuideViewer'

export default async function StudyGuidePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Read the markdown file from public folder (English version)
  const filePath = path.join(process.cwd(), 'public', 'HR_STUDY_GUIDE_EN.md')
  let markdownContent = ''

  try {
    markdownContent = await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading study guide:', error)
  }

  return (
    <StudyGuideViewer
      subject={subject}
      markdownContent={markdownContent}
      subjectId={id}
    />
  )
}
