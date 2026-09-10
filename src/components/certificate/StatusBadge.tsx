import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ExamApplicationStatus } from '@/types/certificate'

const STATUS_LABEL: Record<ExamApplicationStatus, string> = {
  upcoming: '접수예정',
  open: '접수중',
  closed: '접수마감',
}

const STATUS_CLASS: Record<ExamApplicationStatus, string> = {
  upcoming: 'bg-status-orange-bg text-status-orange border-transparent',
  open: 'bg-status-green-bg text-status-green border-transparent',
  closed: 'bg-neutral-light text-neutral border-transparent',
}

export function StatusBadge({ status }: { status: ExamApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
