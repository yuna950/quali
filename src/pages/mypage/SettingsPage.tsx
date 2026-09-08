import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MultiSelectBadges } from '@/components/mypage/MultiSelectBadges'
import { BRANCH_OPTIONS } from '@/mocks/branches'
import { listJobFieldOptions } from '@/services/certificateService'
import { getSettings, updateSettings } from '@/services/userService'
import type { JobFieldOption } from '@/types/certificate'

export function SettingsPage() {
  const [jobFieldOptions, setJobFieldOptions] = useState<JobFieldOption[]>([])
  const [interestFieldCodes, setInterestFieldCodes] = useState<string[]>([])
  const [examRegionCodes, setExamRegionCodes] = useState<string[]>([])

  useEffect(() => {
    Promise.all([listJobFieldOptions(), getSettings()]).then(([fields, settings]) => {
      setJobFieldOptions(fields)
      setInterestFieldCodes(settings.interestFieldCodes)
      setExamRegionCodes(settings.examRegionCodes)
    })
  }, [])

  async function toggleInterestField(code: string) {
    const next = interestFieldCodes.includes(code)
      ? interestFieldCodes.filter((c) => c !== code)
      : [...interestFieldCodes, code]
    setInterestFieldCodes(next)
    await updateSettings({ interestFieldCodes: next })
    toast('관심 분야를 저장했어요.')
  }

  async function toggleExamRegion(code: string) {
    const next = examRegionCodes.includes(code)
      ? examRegionCodes.filter((c) => c !== code)
      : [...examRegionCodes, code]
    setExamRegionCodes(next)
    await updateSettings({ examRegionCodes: next })
    toast('응시 지역을 저장했어요.')
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-1 text-lg font-bold">관심 분야</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          선택한 분야의 자격증을 홈 화면에서 추천해드려요.
        </p>
        <MultiSelectBadges
          options={jobFieldOptions}
          selected={interestFieldCodes}
          onToggle={toggleInterestField}
        />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">응시 지역</h2>
        <p className="mb-3 text-sm text-muted-foreground">주로 시험을 응시하는 지역을 선택해주세요.</p>
        <MultiSelectBadges options={BRANCH_OPTIONS} selected={examRegionCodes} onToggle={toggleExamRegion} />
      </section>
    </div>
  )
}
