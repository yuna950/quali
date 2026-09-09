import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LoginPromptBanner({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link to="/signup" />}>
            회원가입
          </Button>
          <Button nativeButton={false} render={<Link to="/login" />}>
            로그인
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
