import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatYyyymmdd } from '@/lib/date'
import { listExamRecords, removeExamRecord } from '@/services/userService'
import type { ExamRecord } from '@/types/user'

const STAGE_LABEL = { written: '필기', practical: '실기', interview: '면접' } as const

interface CertGroup {
  jmCd: string
  certificateName: string
  representative: ExamRecord
  extraCount: number
}

function groupByCertificate(records: ExamRecord[]): CertGroup[] {
  const byJmCd = new Map<string, ExamRecord[]>()
  for (const record of records) {
    const list = byJmCd.get(record.jmCd) ?? []
    list.push(record)
    byJmCd.set(record.jmCd, list)
  }

  return [...byJmCd.values()].map((list) => {
    const representative = [...list].sort((a, b) => (a.examDate > b.examDate ? -1 : 1))[0]
    return {
      jmCd: representative.jmCd,
      certificateName: representative.certificateName,
      representative,
      extraCount: list.length - 1,
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

  async function handleRemove(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await removeExamRecord(id)
    setRecords((prev) => prev?.filter((r) => r.id !== id) ?? null)
    toast('응시기록을 삭제했어요.')
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {STAGE_LABEL[group.representative.stage]} · {group.representative.year}년{' '}
                  {group.representative.round}회
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatYyyymmdd(group.representative.examDate)}
                  {group.representative.score !== undefined && ` · ${group.representative.score}점`}
                </p>
                {group.representative.memo && (
                  <p className="mt-1 text-sm text-muted-foreground">{group.representative.memo}</p>
                )}
                {group.extraCount > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">외 {group.extraCount}건</p>
                )}
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
                <Badge variant={group.representative.passed ? 'default' : 'secondary'}>
                  {group.representative.passed ? '합격' : '불합격'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={(e) => handleRemove(group.representative.id, e)}>
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
