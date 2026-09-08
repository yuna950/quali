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
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            value === option.value
              ? 'border-brand bg-brand text-white'
              : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
