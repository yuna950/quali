import { Badge } from '@/components/ui/badge'
import { formatDday } from '@/lib/date'

export function DdayBadge({ targetDate }: { targetDate: string }) {
  return <Badge className="bg-brand-light text-brand">{formatDday(targetDate)}</Badge>
}
