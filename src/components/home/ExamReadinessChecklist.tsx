import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  addChecklistCustomItem,
  getChecklist,
  removeChecklistCustomItem,
  toggleChecklistCustomItem,
  toggleDefaultChecklistItem,
} from '@/services/userService'
import type { DefaultChecklistItemId, ExamChecklist } from '@/types/user'

const DEFAULT_ITEMS: { id: DefaultChecklistItemId; label: string }[] = [
  { id: 'idCard', label: '신분증' },
  { id: 'admissionTicket', label: '수험표' },
  { id: 'writingTools', label: '필기구' },
]

export function ExamReadinessChecklist({ planId }: { planId: string }) {
  const [checklist, setChecklist] = useState<ExamChecklist | null>(null)
  const [open, setOpen] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')

  useEffect(() => {
    getChecklist(planId).then(setChecklist)
  }, [planId])

  async function handleToggleDefault(itemId: DefaultChecklistItemId) {
    try {
      setChecklist(await toggleDefaultChecklistItem(planId, itemId))
    } catch {
      toast.error('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  async function handleToggleCustom(itemId: string) {
    try {
      setChecklist(await toggleChecklistCustomItem(planId, itemId))
    } catch {
      toast.error('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  async function handleRemoveCustom(itemId: string) {
    try {
      setChecklist(await removeChecklistCustomItem(planId, itemId))
    } catch {
      toast.error('삭제에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  async function handleAddCustom() {
    const label = newItemLabel.trim()
    if (!label) return
    try {
      setChecklist(await addChecklistCustomItem(planId, label))
      setNewItemLabel('')
      setOpen(false)
      toast.success('준비물을 추가했어요.')
    } catch {
      toast.error('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  if (!checklist) return null

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 text-left" onClick={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <p className="desc-5 text-muted-foreground">준비물 체크리스트</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" size="icon-xs" aria-label="준비물 추가">
                <Plus />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>준비물 추가</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Input
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustom()
                  }
                }}
                placeholder="예: 여분 볼펜"
                autoFocus
              />
            </DialogBody>
            <DialogFooter>
              <Button variant="brand" onClick={handleAddCustom}>
                등록
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEFAULT_ITEMS.map((item) => {
          const checked = checklist.checkedDefaults.includes(item.id)
          return (
            <label
              key={item.id}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5"
            >
              <Checkbox checked={checked} onCheckedChange={() => handleToggleDefault(item.id)} />
              <span className={`text-sm ${checked ? 'text-muted-foreground line-through' : ''}`}>
                {item.label}
              </span>
            </label>
          )
        })}

        {checklist.customItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 rounded-lg border border-border py-1 pr-1 pl-3"
          >
            <label className="flex items-center gap-1.5">
              <Checkbox checked={item.checked} onCheckedChange={() => handleToggleCustom(item.id)} />
              <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>
                {item.label}
              </span>
            </label>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="준비물 삭제"
              onClick={() => handleRemoveCustom(item.id)}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
