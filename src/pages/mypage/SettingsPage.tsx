import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MultiSelectBadges } from '@/components/mypage/MultiSelectBadges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { listJobFieldOptions } from '@/services/certificateService'
import { getSettings, updateSettings } from '@/services/userService'
import type { JobFieldOption } from '@/types/certificate'

export function SettingsPage() {
  const { user, updateName } = useAuth()
  const [jobFieldOptions, setJobFieldOptions] = useState<JobFieldOption[]>([])
  const [interestFieldCodes, setInterestFieldCodes] = useState<string[]>([])
  const [name, setName] = useState(user?.name ?? '')
  const [isEditingName, setIsEditingName] = useState(false)

  useEffect(() => {
    Promise.all([listJobFieldOptions(), getSettings()]).then(([fields, settings]) => {
      setJobFieldOptions(fields)
      setInterestFieldCodes(settings.interestFieldCodes)
    })
  }, [])

  function handleNameButtonClick() {
    if (!isEditingName) {
      setIsEditingName(true)
      return
    }
    if (!name.trim()) return
    updateName(name.trim())
    setIsEditingName(false)
    toast.success('개인정보를 저장했어요.')
  }

  async function toggleInterestField(code: string) {
    const next = interestFieldCodes.includes(code)
      ? interestFieldCodes.filter((c) => c !== code)
      : [...interestFieldCodes, code]
    setInterestFieldCodes(next)
    await updateSettings({ interestFieldCodes: next })
    toast('관심 분야를 저장했어요.')
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="heading-3 mb-1">개인정보</h2>
        <p className="desc-3 mb-3 text-muted-foreground">이름과 이메일을 확인하고 이름을 수정할 수 있어요.</p>
        <div className="flex max-w-sm flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>이메일</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>이름</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditingName} />
          </div>
          <Button size="sm" className="self-start" onClick={handleNameButtonClick}>
            {isEditingName ? '저장' : '수정'}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="heading-3 mb-1">관심 분야</h2>
        <p className="desc-3 mb-1 text-muted-foreground">선택한 분야의 자격증을 홈 화면에서 추천해드려요.</p>
        <p className="desc-5 mb-3 text-muted-foreground">여러 분야를 함께 선택할 수 있어요.</p>
        <MultiSelectBadges
          options={jobFieldOptions}
          selected={interestFieldCodes}
          onToggle={toggleInterestField}
        />
      </section>
    </div>
  )
}
