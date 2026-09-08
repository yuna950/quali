import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ExamApplicationStatus } from '@/types/certificate'

const STATUS_LABEL: Record<ExamApplicationStatus, string> = {
  upcoming: '접수예정',
  open: '접수중',
  closed: '접수마감',
}

const STATUS_CLASS: Record<ExamApplicationStatus, string> = {
  upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
  open: 'bg-brand/10 text-brand border-brand/30',
  closed: 'bg-muted text-muted-foreground border-transparent',
}

export function StatusBadge({ status }: { status: ExamApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
