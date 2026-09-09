import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToggleChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

/** 상태필터/관심분야/합격여부 등 "선택됨/안됨"을 보여주는 토글 칩의 공용 스타일 */
export function ToggleChip({ selected, onClick, children, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        selected ? 'border-brand bg-brand text-white' : 'border-border text-foreground hover:bg-muted',
        className,
      )}
    >
      {children}
    </button>
  )
}
