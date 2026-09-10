import { Badge } from '@/components/ui/badge'
import { formatDday } from '@/lib/date'

export function DdayBadge({ targetDate }: { targetDate: string }) {
  return <Badge className="bg-foreground text-background">{formatDday(targetDate)}</Badge>
}
