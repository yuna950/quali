import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LoginPromptBanner({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link to="/signup" />}>
            회원가입
          </Button>
          <Button render={<Link to="/login" />}>로그인</Button>
        </div>
      </CardContent>
    </Card>
  )
}
