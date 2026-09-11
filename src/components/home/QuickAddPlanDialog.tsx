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
import { formatYyyymmdd } from '@/lib/date'
import { getExamSchedules, listCertificates } from '@/services/certificateService'
import { addMyPlan } from '@/services/userService'
import type { Certificate, ExamStageKey } from '@/types/certificate'
import type { MyExamPlan } from '@/types/user'

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

export function QuickAddPlanDialog({
  trigger,
  onAdded,
}: {
  trigger: ReactNode
  onAdded: (plan: MyExamPlan) => void
}) {
  const [open, setOpen] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  const [certOption, setCertOption] = useState<CertOption | null>(null)
  const [stage, setStage] = useState<ExamStageKey>('written')
  const [year, setYear] = useState(String(CURRENT_YEAR))
  const [round, setRound] = useState('1')
  const [examDate, setExamDate] = useState('')
  const [roundOptions, setRoundOptions] = useState<RoundOption[]>([])
  const [selectedRoundKey, setSelectedRoundKey] = useState<string>(MANUAL_KEY)

  const certOptions: CertOption[] = certificates.map((c) => ({ value: c.jmCd, label: c.name }))

  useEffect(() => {
    listCertificates().then(setCertificates)
  }, [])

  useEffect(() => {
    if (!open) {
      setCertOption(null)
      setStage('written')
      setYear(String(CURRENT_YEAR))
      setRound('1')
      setExamDate('')
      setSelectedRoundKey(MANUAL_KEY)
    }
  }, [open])

  useEffect(() => {
    if (!open || !certOption) {
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

      if (options.length > 0) {
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
  }, [open, certOption, stage])

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

  async function handleSubmit() {
    if (!certOption || !examDate) {
      toast.error('자격증과 시험날짜는 필수예요.')
      return
    }

    const created = await addMyPlan({
      jmCd: certOption.value,
      certificateName: certOption.label,
      stage,
      year: Number(year),
      round: Number(round),
      examDate: examDate.replaceAll('-', ''),
    })

    onAdded(created)
    toast.success('나의 시험에 추가했어요.')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>나의 시험 추가</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>자격증</Label>
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>단계</Label>
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
          </div>

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
              <p className="desc-5 text-muted-foreground">
                {certOption ? '실제 등록된 회차 정보가 없어요. 아래에서 직접 입력해주세요.' : '자격증을 먼저 선택하세요.'}
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
            examDate && (
              <p className="desc-4 text-muted-foreground">{formatYyyymmdd(examDate.replaceAll('-', ''))}</p>
            )
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
