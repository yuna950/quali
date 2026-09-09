import { ToggleChip } from '@/components/common/ToggleChip'

interface Option {
  code: string
  name: string
}

interface MultiSelectBadgesProps {
  options: Option[]
  selected: string[]
  onToggle: (code: string) => void
}

export function MultiSelectBadges({ options, selected, onToggle }: MultiSelectBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ToggleChip key={option.code} selected={selected.includes(option.code)} onClick={() => onToggle(option.code)}>
          {option.name}
        </ToggleChip>
      ))}
    </div>
  )
}
