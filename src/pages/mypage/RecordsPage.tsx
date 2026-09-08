import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listExamRecords } from '@/services/userService'
import type { ExamRecord } from '@/types/user'

interface CertGroup {
  jmCd: string
  certificateName: string
  count: number
  latestPassed: boolean
}

function groupByCertificate(records: ExamRecord[]): CertGroup[] {
  const groups = new Map<string, CertGroup & { latestDate: string }>()
  for (const record of records) {
    const existing = groups.get(record.jmCd)
    if (!existing || record.examDate >= existing.latestDate) {
      groups.set(record.jmCd, {
        jmCd: record.jmCd,
        certificateName: record.certificateName,
        count: (existing?.count ?? 0) + 1,
        latestPassed: record.passed,
        latestDate: record.examDate,
      })
    } else {
      existing.count += 1
    }
  }
  return [...groups.values()]
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
        <ExamRecordFormDialog mode="create" trigger={<Button>응시 기록 추가</Button>} onSaved={handleSaved} />
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">응시 기록이 없어요.</p>
          </CardContent>
        </Card>
      )}

      {groups.map((group) => (
        <Link key={group.jmCd} to={`/mypage/records/${group.jmCd}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{group.certificateName}</p>
                <p className="mt-1 text-sm text-muted-foreground">응시 기록 {group.count}건</p>
              </div>
              <Badge variant={group.latestPassed ? 'default' : 'secondary'}>
                {group.latestPassed ? '합격' : '불합격'}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
