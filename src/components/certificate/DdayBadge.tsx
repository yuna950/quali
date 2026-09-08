import { Badge } from '@/components/ui/badge'
import { diffInDays } from '@/lib/date'

export function DdayBadge({ targetDate }: { targetDate: string }) {
  const days = diffInDays(targetDate)
  const label = days === 0 ? 'D-DAY' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`

  return (
    <Badge className="bg-foreground text-background">
      {label}
    </Badge>
  )
}
