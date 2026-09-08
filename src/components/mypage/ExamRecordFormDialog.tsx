import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatYyyymmdd } from '@/lib/date'
import { listCertificates } from '@/services/certificateService'
import { addExamRecord, updateExamRecord } from '@/services/userService'
import type { Certificate, ExamStageKey } from '@/types/certificate'
import type { ExamRecord, MyExamPlan } from '@/types/user'

const STAGE_LABEL: Record<ExamStageKey, string> = { written: '필기', practical: '실기', interview: '면접' }
const CURRENT_YEAR = new Date().getFullYear()

interface CertOption {
  value: string
  label: string
}

type ExamRecordFormDialogProps = {
  trigger: ReactNode
  onSaved: (record: ExamRecord) => void
} & ({ mode: 'create'; lockedPlan?: MyExamPlan } | { mode: 'edit'; record: ExamRecord })

export function ExamRecordFormDialog(props: ExamRecordFormDialogProps) {
  const { trigger, onSaved, mode } = props
  const lockedPlan = mode === 'create' ? props.lockedPlan : undefined
  const editingRecord = mode === 'edit' ? props.record : undefined

  const [open, setOpen] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  const [certOption, setCertOption] = useState<CertOption | null>(null)
  const [stage, setStage] = useState<ExamStageKey>('written')
  const [year, setYear] = useState(String(CURRENT_YEAR))
  const [round, setRound] = useState('1')
  const [examDate, setExamDate] = useState('')
  const [passed, setPassed] = useState<boolean | null>(null)
  const [score, setScore] = useState('')
  const [memo, setMemo] = useState('')

  const isLocked = !!lockedPlan
  const certOptions: CertOption[] = certificates.map((c) => ({ value: c.jmCd, label: c.name }))

  useEffect(() => {
    listCertificates().then(setCertificates)
  }, [])

  useEffect(() => {
    if (!open) return

    if (editingRecord) {
      setCertOption({ value: editingRecord.jmCd, label: editingRecord.certificateName })
      setStage(editingRecord.stage)
      setYear(String(editingRecord.year))
      setRound(String(editingRecord.round))
      setExamDate(editingRecord.examDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'))
      setPassed(editingRecord.passed)
      setScore(editingRecord.score !== undefined ? String(editingRecord.score) : '')
      setMemo(editingRecord.memo ?? '')
    } else if (lockedPlan) {
      setCertOption({ value: lockedPlan.jmCd, label: lockedPlan.certificateName })
      setStage(lockedPlan.stage)
      setYear(String(lockedPlan.year))
      setRound(String(lockedPlan.round))
      setExamDate(lockedPlan.examDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'))
      setPassed(null)
      setScore('')
      setMemo('')
    } else {
      setCertOption(null)
      setStage('written')
      setYear(String(CURRENT_YEAR))
      setRound('1')
      setExamDate('')
      setPassed(null)
      setScore('')
      setMemo('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit() {
    if (!certOption || !examDate || passed === null) {
      toast.error('자격증, 시험날짜, 합격여부는 필수예요.')
      return
    }

    const payload = {
      jmCd: certOption.value,
      certificateName: certOption.label,
      stage,
      year: Number(year),
      round: Number(round),
      examDate: examDate.replaceAll('-', ''),
      passed,
      score: score ? Number(score) : undefined,
      memo: memo || undefined,
    }

    if (editingRecord) {
      const updated = await updateExamRecord(editingRecord.id, payload)
      if (updated) {
        onSaved(updated)
        toast.success('응시기록을 수정했어요.')
      }
    } else {
      const created = await addExamRecord({ ...payload, planId: lockedPlan?.id })
      onSaved(created)
      toast.success('응시기록을 추가했어요.')
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingRecord ? '응시기록 수정' : '응시기록 추가'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>자격증</Label>
            {isLocked ? (
              <p className="text-sm font-medium">{certOption?.label}</p>
            ) : (
              <Combobox items={certOptions} value={certOption} onValueChange={(v) => setCertOption(v)}>
                <ComboboxInput placeholder="자격증을 검색하세요" />
                <ComboboxContent>
                  <ComboboxEmpty>검색 결과가 없어요</ComboboxEmpty>
                  <ComboboxList>
                    {(item: CertOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>단계</Label>
            {isLocked ? (
              <p className="text-sm font-medium">{STAGE_LABEL[stage]}</p>
            ) : (
              <Select value={stage} onValueChange={(v) => setStage(v as ExamStageKey)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: ExamStageKey | null) => (v ? STAGE_LABEL[v] : '단계를 선택하세요')}</SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="written">필기</SelectItem>
                  <SelectItem value="practical">실기</SelectItem>
                  <SelectItem value="interview">면접</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {isLocked ? (
            <div className="flex gap-4">
              <p className="text-sm text-muted-foreground">
                {year}년 {round}회 · {formatYyyymmdd(lockedPlan!.examDate)}
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>연도</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>회차</Label>
                  <Input type="number" value={round} onChange={(e) => setRound(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>시험날짜</Label>
                <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>합격여부</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={passed === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPassed(true)}
              >
                합격
              </Button>
              <Button
                type="button"
                variant={passed === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPassed(false)}
              >
                불합격
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>점수 (선택)</Label>
            <Input type="number" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>메모 (선택)</Label>
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
