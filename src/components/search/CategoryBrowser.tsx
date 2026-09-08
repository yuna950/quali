import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  listCertificates,
  listJobFieldOptions,
  listMidJobFieldOptions,
  type MidJobFieldOption,
} from '@/services/certificateService'
import type { Certificate, JobFieldOption } from '@/types/certificate'

interface CategoryBrowserProps {
  selectedJobFieldCode?: string
  selectedMidJobFieldCode?: string
  selectedJmCd?: string
  onSelectJobField: (code: string) => void
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
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className="max-h-72 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-xs font-bold text-muted-foreground">직무분야</p>
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
          <p className="px-3 text-sm text-muted-foreground">직무분야를 선택해주세요</p>
        )}
        {selectedJobFieldCode && midJobFields.length === 0 && (
          <p className="px-3 text-sm text-muted-foreground">해당 분야에 자격증이 없어요</p>
        )}
        {midJobFields.map((field) => (
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
          <p className="px-3 text-sm text-muted-foreground">분류를 선택해주세요</p>
        )}
        {selectedMidJobFieldCode && certificates.length === 0 && (
          <p className="px-3 text-sm text-muted-foreground">해당 분류에 자격증이 없어요</p>
        )}
        {certificates.map((certificate) => (
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
  )
}
