import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { CategoryBrowser } from '@/components/search/CategoryBrowser'
import { StatusFilterTags, type StatusFilterValue } from '@/components/search/StatusFilterTags'
import { Input } from '@/components/ui/input'
import { getExamSchedulesByJmCds, searchCertificates } from '@/services/certificateService'
import type { Certificate, ExamSchedule } from '@/types/certificate'

export function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [jobFieldCode, setJobFieldCode] = useState<string>()
  const [midJobFieldCode, setMidJobFieldCode] = useState<string>()
  const [jmCd, setJmCd] = useState<string>()
  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [schedulesByJmCd, setSchedulesByJmCd] = useState<Map<string, ExamSchedule[]>>(new Map())

  const showCategoryBrowser = keyword.trim() === ''

  useEffect(() => {
    let active = true

    searchCertificates({
      keyword: keyword.trim() || undefined,
      jobFieldCode: showCategoryBrowser ? jobFieldCode : undefined,
      midJobFieldCode: showCategoryBrowser ? midJobFieldCode : undefined,
      jmCd: showCategoryBrowser ? jmCd : undefined,
      status: status === 'all' ? undefined : status,
    }).then(async (certs) => {
      // 카드마다 따로 일정을 조회하지 않도록, 검색 결과에 뜰 자격증들의 일정을 한 번에 모아서 가져온다
      const schedules = await getExamSchedulesByJmCds(certs.map((c) => c.jmCd))
      if (!active) return
      setCertificates(certs)
      setSchedulesByJmCd(schedules)
    })

    return () => {
      active = false
    }
  }, [keyword, jobFieldCode, midJobFieldCode, jmCd, status, showCategoryBrowser])

  function handleKeywordChange(value: string) {
    setKeyword(value)
    if (value.trim() !== '') {
      setJobFieldCode(undefined)
      setMidJobFieldCode(undefined)
      setJmCd(undefined)
    }
  }

  function handleSelectJobField(code: string) {
    setKeyword('')
    setJobFieldCode(code)
    setMidJobFieldCode(undefined)
    setJmCd(undefined)
  }

  function handleClearJobField() {
    setJobFieldCode(undefined)
    setMidJobFieldCode(undefined)
    setJmCd(undefined)
  }

  function handleSelectMidJobField(code: string) {
    setKeyword('')
    setMidJobFieldCode(code)
    setJmCd(undefined)
  }

  function handleSelectCertificate(code: string) {
    setKeyword('')
    setJmCd(code)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="relative">
        <Input
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="자격증명을 검색해보세요"
          className="h-12 rounded-full pr-12 pl-5"
        />
        <Search className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground" />
      </div>

      {showCategoryBrowser && (
        <CategoryBrowser
          selectedJobFieldCode={jobFieldCode}
          selectedMidJobFieldCode={midJobFieldCode}
          selectedJmCd={jmCd}
          onSelectJobField={handleSelectJobField}
          onClearJobField={handleClearJobField}
          onSelectMidJobField={handleSelectMidJobField}
          onSelectCertificate={handleSelectCertificate}
        />
      )}

      <StatusFilterTags value={status} onChange={setStatus} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.jmCd}
            certificate={certificate}
            schedules={schedulesByJmCd.get(certificate.jmCd) ?? []}
          />
        ))}
        {certificates.length === 0 && (
          <p className="desc-3 col-span-full text-muted-foreground">조건에 맞는 자격증이 없어요.</p>
        )}
      </div>
    </div>
  )
}
