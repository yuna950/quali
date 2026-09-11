import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatYyyymmdd } from '@/lib/date'
import { listExamRecords } from '@/services/userService'
import type { ExamRecord } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const
const VISIBLE_LIMIT = 2

interface CertGroup {
  jmCd: string
  certificateName: string
  visible: ExamRecord[]
  moreCount: number
}

function groupByCertificate(records: ExamRecord[]): CertGroup[] {
  const byJmCd = new Map<string, ExamRecord[]>()
  for (const record of records) {
    const list = byJmCd.get(record.jmCd) ?? []
    list.push(record)
    byJmCd.set(record.jmCd, list)
  }

  return [...byJmCd.values()].map((list) => {
    const sorted = [...list].sort((a, b) => (a.examDate > b.examDate ? -1 : 1))
    return {
      jmCd: sorted[0].jmCd,
      certificateName: sorted[0].certificateName,
      visible: sorted.slice(0, VISIBLE_LIMIT),
      moreCount: Math.max(0, sorted.length - VISIBLE_LIMIT),
    }
  })
}

export function RecordsPage() {
  const [records, setRecords] = useState<ExamRecord[] | null>(null)

  useEffect(() => {
    listExamRecords().then(setRecords)
  }, [])

  function handleSaved(record: ExamRecord) {
    setRecords((prev) => {
      if (!prev) return [record]
      const exists = prev.some((r) => r.id === record.id)
      return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [...prev, record]
    })
  }

  if (!records) return null

  const groups = groupByCertificate(records)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ExamRecordFormDialog
          mode="create"
          trigger={
            <Button variant="outline" size="sm" className="text-brand hover:bg-brand/5">
              <Plus />
              기록 추가
            </Button>
          }
          onSaved={handleSaved}
        />
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="desc-3 text-muted-foreground">응시 기록이 없어요.</p>
          </CardContent>
        </Card>
      )}

      {groups.map((group) => (
        <Link key={group.jmCd} to={`/mypage/records/${group.jmCd}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3">
              <p className="heading-4">{group.certificateName}</p>

              {group.visible.map((record, i) => (
                <div key={record.id} className={i > 0 ? 'border-t border-border pt-3' : ''}>
                  <p className="desc-5 text-muted-foreground">
                    {STAGE_LABEL[record.stage]} · {record.year}년 {record.round}회
                  </p>
                  <p className="desc-4 mt-1 text-muted-foreground">
                    {formatYyyymmdd(record.examDate)}
                    {record.score !== undefined && ` · ${record.score}점`}
                    {' · '}
                    <span className={record.passed ? 'font-medium text-brand' : 'font-medium text-neutral'}>
                      {record.passed ? '합격' : '불합격'}
                    </span>
                  </p>
                  {record.memo && <p className="desc-4 mt-1 text-muted-foreground">{record.memo}</p>}
                </div>
              ))}

              {group.moreCount > 0 && (
                <p className="desc-5 text-muted-foreground">외 {group.moreCount}건 더 보기 →</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
