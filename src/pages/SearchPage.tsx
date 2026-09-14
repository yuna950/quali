import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CertificateCard } from '@/components/certificate/CertificateCard'
import { CategoryBrowser } from '@/components/search/CategoryBrowser'
import { StatusFilterTags, type StatusFilterValue } from '@/components/search/StatusFilterTags'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { getExamSchedulesByJmCds, searchCertificates } from '@/services/certificateService'
import type { Certificate, ExamSchedule } from '@/types/certificate'

const PAGE_SIZE = 12

/** 페이지가 많을 때 "1 2 3 4 5 ... 52"처럼 가운데를 생략한 페이지 번호 목록을 만든다.
 * 최소 5페이지까지는 항상 숫자로 보이고, 현재 페이지 주변(-1~+1)과 마지막 페이지도 항상 보인다. */
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const shown = new Set<number>()
  for (let p = 1; p <= Math.min(5, total); p += 1) shown.add(p)
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p += 1) shown.add(p)
  shown.add(total)

  const sorted = [...shown].sort((a, b) => a - b)
  const pages: (number | 'ellipsis')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push('ellipsis')
    pages.push(p)
  })
  return pages
}

export function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [jobFieldCode, setJobFieldCode] = useState<string>()
  const [midJobFieldCode, setMidJobFieldCode] = useState<string>()
  const [jmCd, setJmCd] = useState<string>()
  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)
  const [schedulesByJmCd, setSchedulesByJmCd] = useState<Map<string, ExamSchedule[]>>(new Map())
  const [page, setPage] = useState(1)

  const showCategoryBrowser = keyword.trim() === ''

  useEffect(() => {
    let active = true
    setCertificates(null)
    setPage(1)

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

  const totalPages = certificates ? Math.max(1, Math.ceil(certificates.length / PAGE_SIZE)) : 1
  const pageItems = certificates?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goToPage(p: number) {
    setPage(Math.min(Math.max(p, 1), totalPages))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        {certificates === null &&
          Array.from({ length: PAGE_SIZE }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}

        {pageItems?.map((certificate) => (
          <CertificateCard
            key={certificate.jmCd}
            certificate={certificate}
            schedules={schedulesByJmCd.get(certificate.jmCd) ?? []}
          />
        ))}
        {certificates?.length === 0 && (
          <p className="desc-3 col-span-full text-muted-foreground">조건에 맞는 자격증이 없어요.</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page - 1)
                }}
              />
            </PaginationItem>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault()
                      goToPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
