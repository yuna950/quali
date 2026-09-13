import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'

function toErrorMessage(message: string): string {
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 필요해요. 받은 메일함을 확인해주세요.'
  }
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않아요.'
  }
  return '로그인에 실패했어요.'
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await login(email, password)
    setIsSubmitting(false)

    if (result.error) {
      setError(toErrorMessage(result.error))
      return
    }

    navigate(searchParams.get('redirect') ?? '/')
  }

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="heading-2 mb-6">로그인</h1>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="desc-4 text-status-red">{error}</p>}
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                로그인
              </Button>
              <p className="desc-5 text-center text-muted-foreground">
                아직 계정이 없으신가요?{' '}
                <Link to="/signup" className="text-brand hover:underline">
                  회원가입
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
