import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { addInterest, isInterested, removeInterest } from '@/services/userService'

export function InterestButton({ jmCd, className }: { jmCd: string; className?: string }) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [interested, setInterested] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      setInterested(false)
      return
    }
    isInterested(jmCd).then(setInterested)
  }, [jmCd, isLoggedIn])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (interested) {
      await removeInterest(jmCd)
      setInterested(false)
    } else {
      await addInterest(jmCd)
      setInterested(true)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={interested ? '관심 자격증 해제' : '관심 자격증 추가'}
      aria-pressed={interested}
      onClick={handleClick}
      className={className}
    >
      <Heart className={cn('size-4', interested && 'fill-destructive text-destructive')} />
    </Button>
  )
}
