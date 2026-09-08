import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ExamRecordFormDialog } from '@/components/mypage/ExamRecordFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatYyyymmdd } from '@/lib/date'
import { listExamRecords, removeExamRecord } from '@/services/userService'
import type { ExamStageKey } from '@/types/certificate'
import type { ExamRecord } from '@/types/user'

const STAGE_LABEL: Record<ExamStageKey, string> = { written: '필기', practical: '실기', interview: '면접' }

export function RecordsPage() {
  const [records, setRecords] = useState<ExamRecord[] | null>(null)

  useEffect(() => {
    listExamRecords().then(setRecords)
  }, [])

  const ownRecords = records?.filter((r) => !r.planId) ?? []

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
    setRecords((prev) => prev?.filter((r) => r.id !== id) ?? null)
    await removeExamRecord(id)
    toast('응시 기록을 삭제했어요.')
  }

  if (!records) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ExamRecordFormDialog mode="create" trigger={<Button>응시 기록 추가</Button>} onSaved={handleSaved} />
      </div>

      {ownRecords.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">응시 기록이 없어요.</p>
          </CardContent>
        </Card>
      )}

      {ownRecords.map((record) => (
        <Link key={record.id} to={`/certificates/${record.jmCd}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {STAGE_LABEL[record.stage]} · {record.year}년 {record.round}회
                </p>
                <p className="text-lg font-bold">{record.certificateName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatYyyymmdd(record.examDate)}
                  {record.score !== undefined && ` · ${record.score}점`}
                </p>
                {record.memo && <p className="mt-1 text-sm text-muted-foreground">{record.memo}</p>}
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                <Badge variant={record.passed ? 'default' : 'secondary'}>
                  {record.passed ? '합격' : '불합격'}
                </Badge>
                <ExamRecordFormDialog
                  mode="edit"
                  record={record}
                  trigger={
                    <Button variant="ghost" size="sm">
                      수정
                    </Button>
                  }
                  onSaved={handleSaved}
                />
                <Button variant="ghost" size="sm" onClick={(e) => handleRemove(record.id, e)}>
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
