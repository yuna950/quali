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
      {options.map((option) => {
        const isSelected = selected.includes(option.code)
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => onToggle(option.code)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? 'border-brand bg-brand text-white'
                : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            {option.name}
          </button>
        )
      })}
    </div>
  )
}
