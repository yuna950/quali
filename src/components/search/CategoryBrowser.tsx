import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  listCertificates,
  listJobFieldOptions,
  listMidJobFieldOptions,
  type MidJobFieldOption,
} from '@/services/certificateService'
import type { Certificate, JobFieldOption } from '@/types/certificate'

const ALL_VALUE = '__all__'

interface CategoryBrowserProps {
  selectedJobFieldCode?: string
  selectedMidJobFieldCode?: string
  selectedJmCd?: string
  onSelectJobField: (code: string) => void
  onClearJobField: () => void
  onSelectMidJobField: (code: string) => void
  onSelectCertificate: (jmCd: string) => void
}

function ColumnButton({
  label,
  selected,
  filled,
  showChevron,
  onClick,
}: {
  label: string
  selected: boolean
  filled?: boolean
  showChevron?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
        filled
          ? 'bg-brand text-white'
          : selected
            ? 'bg-brand/10 text-brand font-medium'
            : 'hover:bg-muted'
      }`}
    >
      <span className="truncate">{label}</span>
      {showChevron && <ChevronRight className="size-4 shrink-0" />}
    </button>
  )
}

export function CategoryBrowser({
  selectedJobFieldCode,
  selectedMidJobFieldCode,
  selectedJmCd,
  onSelectJobField,
  onClearJobField,
  onSelectMidJobField,
  onSelectCertificate,
}: CategoryBrowserProps) {
  const [jobFields, setJobFields] = useState<JobFieldOption[]>([])
  const [midJobFields, setMidJobFields] = useState<MidJobFieldOption[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    listJobFieldOptions().then(setJobFields)
  }, [])

  useEffect(() => {
    if (!selectedJobFieldCode) return
    let active = true
    listMidJobFieldOptions(selectedJobFieldCode).then((options) => {
      if (active) setMidJobFields(options)
    })
    return () => {
      active = false
    }
  }, [selectedJobFieldCode])

  useEffect(() => {
    if (!selectedJobFieldCode || !selectedMidJobFieldCode) return
    let active = true
    listCertificates().then((all) => {
      if (!active) return
      setCertificates(
        all.filter(
          (c) => c.jobFieldCode === selectedJobFieldCode && c.midJobFieldCode === selectedMidJobFieldCode,
        ),
      )
    })
    return () => {
      active = false
    }
  }, [selectedJobFieldCode, selectedMidJobFieldCode])

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        <Select
          value={selectedJobFieldCode ?? ALL_VALUE}
          onValueChange={(v) => (v && v !== ALL_VALUE ? onSelectJobField(v) : onClearJobField())}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {() =>
                selectedJobFieldCode
                  ? (jobFields.find((f) => f.code === selectedJobFieldCode)?.name ?? '직무분야')
                  : '직무분야: 전체'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value={ALL_VALUE}>전체</SelectItem>
            {jobFields.map((field) => (
              <SelectItem key={field.code} value={field.code}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedMidJobFieldCode ?? null}
          onValueChange={(v) => v && onSelectMidJobField(v)}
          disabled={!selectedJobFieldCode}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string | null) => {
                if (!selectedJobFieldCode) return '직무분야를 먼저 선택하세요'
                if (!v) return '분류를 선택하세요'
                return midJobFields.find((f) => f.code === v)?.name ?? '분류를 선택하세요'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {midJobFields.map((field) => (
              <SelectItem key={field.code} value={field.code}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedJmCd ?? null}
          onValueChange={(v) => v && onSelectCertificate(v)}
          disabled={!selectedMidJobFieldCode}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string | null) => {
                if (!selectedMidJobFieldCode) return '분류를 먼저 선택하세요'
                if (!v) return '시행종목을 선택하세요'
                return certificates.find((c) => c.jmCd === v)?.name ?? '시행종목을 선택하세요'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {certificates.map((certificate) => (
              <SelectItem key={certificate.jmCd} value={certificate.jmCd}>
                {certificate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden divide-x divide-border rounded-xl border border-border sm:grid sm:grid-cols-3">
        <div className="max-h-72 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-xs font-bold text-muted-foreground">직무분야</p>
          <ColumnButton label="전체" selected={!selectedJobFieldCode} onClick={onClearJobField} />
          {jobFields.map((field) => (
            <ColumnButton
              key={field.code}
              label={field.name}
              selected={field.code === selectedJobFieldCode}
              showChevron={field.code === selectedJobFieldCode}
              onClick={() => onSelectJobField(field.code)}
            />
          ))}
        </div>

        <div className="max-h-72 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-xs font-bold text-muted-foreground">분류</p>
          {!selectedJobFieldCode && (
            <p className="desc-4 px-3 text-muted-foreground">직무분야를 선택해주세요</p>
          )}
          {selectedJobFieldCode && midJobFields.length === 0 && (
            <p className="desc-4 px-3 text-muted-foreground">해당 분야에 자격증이 없어요</p>
          )}
          {selectedJobFieldCode &&
            midJobFields.map((field) => (
              <ColumnButton
                key={field.code}
                label={field.name}
                selected={field.code === selectedMidJobFieldCode}
                showChevron={field.code === selectedMidJobFieldCode}
                onClick={() => onSelectMidJobField(field.code)}
              />
            ))}
        </div>

        <div className="max-h-72 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-xs font-bold text-muted-foreground">시행종목</p>
          {!selectedMidJobFieldCode && (
            <p className="desc-4 px-3 text-muted-foreground">분류를 선택해주세요</p>
          )}
          {selectedMidJobFieldCode && certificates.length === 0 && (
            <p className="desc-4 px-3 text-muted-foreground">해당 분류에 자격증이 없어요</p>
          )}
          {selectedMidJobFieldCode &&
            certificates.map((certificate) => (
              <ColumnButton
                key={certificate.jmCd}
                label={certificate.name}
                selected={certificate.jmCd === selectedJmCd}
                filled={certificate.jmCd === selectedJmCd}
                onClick={() => onSelectCertificate(certificate.jmCd)}
              />
            ))}
        </div>
      </div>
    </>
  )
}
