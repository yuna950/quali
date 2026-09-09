import { ToggleChip } from '@/components/common/ToggleChip'
import type { ExamApplicationStatus } from '@/types/certificate'

export type StatusFilterValue = ExamApplicationStatus | 'all'

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '접수중' },
  { value: 'upcoming', label: '접수예정' },
  { value: 'closed', label: '접수마감' },
]

export function StatusFilterTags({
  value,
  onChange,
}: {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <ToggleChip key={option.value} selected={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </ToggleChip>
      ))}
    </div>
  )
}
