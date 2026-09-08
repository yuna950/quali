import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button variant="ghost" size="icon" aria-label="뒤로가기" onClick={() => navigate(-1)}>
      <ArrowLeft className="size-5" />
    </Button>
  )
}
