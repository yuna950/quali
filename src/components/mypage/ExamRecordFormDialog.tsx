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
import { getExamSchedules, listCertificates } from '@/services/certificateService'
import { addExamRecord, removeMyPlan, updateExamRecord } from '@/services/userService'
import type { Certificate, ExamStageKey } from '@/types/certificate'
import type { ExamRecord, MyExamPlan } from '@/types/user'

const STAGE_LABEL: Record<ExamStageKey, string> = { written: '필기', practical: '실기', interview: '면접' }
const CURRENT_YEAR = new Date().getFullYear()
const MANUAL_KEY = 'manual'

interface CertOption {
  value: string
  label: string
}

interface RoundOption {
  key: string
  year: number
  round: number
  examDate: string
}

function toDateInputValue(yyyymmdd: string): string {
  return yyyymmdd.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
}

type ExamRecordFormDialogProps = {
  trigger: ReactNode
  onSaved: (record: ExamRecord) => void
  /** lockedPlan을 결과입력해서 저장하면 그 플랜을 삭제한 뒤 알려줌 */
  onPlanRemoved?: (planId: string) => void
} & (
  | { mode: 'create'; lockedPlan?: MyExamPlan; presetJmCd?: string }
  | { mode: 'edit'; record: ExamRecord }
)

export function ExamRecordFormDialog(props: ExamRecordFormDialogProps) {
  const { trigger, onSaved, onPlanRemoved, mode } = props
  const lockedPlan = mode === 'create' ? props.lockedPlan : undefined
  const presetJmCd = mode === 'create' ? props.presetJmCd : undefined
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
  const [roundOptions, setRoundOptions] = useState<RoundOption[]>([])
  const [selectedRoundKey, setSelectedRoundKey] = useState<string>(MANUAL_KEY)

  const isLocked = !!lockedPlan
  const certOptions: CertOption[] = certificates.map((c) => ({ value: c.jmCd, label: c.name }))

  useEffect(() => {
    listCertificates().then(setCertificates)
  }, [])

  useEffect(() => {
    if (isLocked || !open || !certOption) {
      setRoundOptions([])
      return
    }

    let active = true
    getExamSchedules(certOption.value).then((schedules) => {
      if (!active) return

      const options: RoundOption[] = schedules
        .filter((s) => s.stages[stage])
        .map((s) => ({
          key: `${s.year}-${s.round}`,
          year: s.year,
          round: s.round,
          examDate: s.stages[stage]?.examStart ?? s.stages[stage]?.regStart ?? '',
        }))
        .sort((a, b) => a.year - b.year || a.round - b.round)

      setRoundOptions(options)

      const matched = options.find((o) => o.year === Number(year) && o.round === Number(round))
      if (matched) {
        setSelectedRoundKey(matched.key)
      } else if (options.length > 0 && !editingRecord) {
        setSelectedRoundKey(options[0].key)
        setYear(String(options[0].year))
        setRound(String(options[0].round))
        if (options[0].examDate) setExamDate(toDateInputValue(options[0].examDate))
      } else {
        setSelectedRoundKey(MANUAL_KEY)
      }
    })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLocked, certOption?.value, stage])

  function handleRoundSelect(key: string | null) {
    if (!key) return
    setSelectedRoundKey(key)
    if (key === MANUAL_KEY) return
    const option = roundOptions.find((o) => o.key === key)
    if (!option) return
    setYear(String(option.year))
    setRound(String(option.round))
    if (option.examDate) setExamDate(toDateInputValue(option.examDate))
  }

  useEffect(() => {
    if (!open) return

    if (editingRecord) {
      setCertOption({ value: editingRecord.jmCd, label: editingRecord.certificateName })
      setStage(editingRecord.stage)
      setYear(String(editingRecord.year))
      setRound(String(editingRecord.round))
      setExamDate(toDateInputValue(editingRecord.examDate))
      setPassed(editingRecord.passed)
      setScore(editingRecord.score !== undefined ? String(editingRecord.score) : '')
      setMemo(editingRecord.memo ?? '')
    } else if (lockedPlan) {
      setCertOption({ value: lockedPlan.jmCd, label: lockedPlan.certificateName })
      setStage(lockedPlan.stage)
      setYear(String(lockedPlan.year))
      setRound(String(lockedPlan.round))
      setExamDate(toDateInputValue(lockedPlan.examDate))
      setPassed(null)
      setScore('')
      setMemo('')
    } else {
      const preset = presetJmCd ? certificates.find((c) => c.jmCd === presetJmCd) : undefined
      setCertOption(preset ? { value: preset.jmCd, label: preset.name } : null)
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

      if (lockedPlan) {
        await removeMyPlan(lockedPlan.id)
        onPlanRemoved?.(lockedPlan.id)
      }

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
              <div className="flex flex-col gap-1.5">
                <Label>회차</Label>
                {roundOptions.length > 0 ? (
                  <Select value={selectedRoundKey} onValueChange={handleRoundSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v: string | null) => {
                          if (!v || v === MANUAL_KEY) return '직접 입력'
                          const option = roundOptions.find((o) => o.key === v)
                          return option ? `${option.year}년 ${option.round}회` : '회차를 선택하세요'
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {roundOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.year}년 {option.round}회
                          {option.examDate && ` · ${formatYyyymmdd(option.examDate)}`}
                        </SelectItem>
                      ))}
                      <SelectItem value={MANUAL_KEY}>직접 입력</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    실제 등록된 회차 정보가 없어요. 아래에서 직접 입력해주세요.
                  </p>
                )}
              </div>

              {selectedRoundKey === MANUAL_KEY ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">{formatYyyymmdd(examDate.replaceAll('-', ''))}</p>
              )}
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
