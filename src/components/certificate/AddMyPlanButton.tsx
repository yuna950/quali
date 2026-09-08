import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { addMyPlan, listMyPlans, removeMyPlan } from '@/services/userService'
import type { ExamStageKey } from '@/types/certificate'

interface AddMyPlanButtonProps {
  jmCd: string
  certificateName: string
  stage: ExamStageKey
  year: number
  round: number
  examDate: string
  examLocation?: string
}

export function AddMyPlanButton(props: AddMyPlanButtonProps) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [planId, setPlanId] = useState<string>()

  useEffect(() => {
    if (!isLoggedIn) return
    let active = true
    listMyPlans().then((plans) => {
      if (!active) return
      const existing = plans.find(
        (p) =>
          p.jmCd === props.jmCd && p.stage === props.stage && p.year === props.year && p.round === props.round,
      )
      setPlanId(existing?.id)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, props.jmCd, props.stage, props.year, props.round])

  async function handleClick() {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (planId) {
      const removedId = planId
      setPlanId(undefined)
      await removeMyPlan(removedId)
      toast('나의 시험에서 삭제했어요.')
      return
    }

    const created = await addMyPlan(props)
    setPlanId(created.id)
    toast.success('나의 시험에 추가했어요.')
  }

  return (
    <Button variant={planId ? 'secondary' : 'outline'} size="sm" onClick={handleClick}>
      {planId ? '추가됨' : '나의 시험 추가'}
    </Button>
  )
}
