import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TEST_ACCOUNT, useAuth } from '@/lib/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const success = login(email, password)
    if (success) {
      navigate(searchParams.get('redirect') ?? '/')
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">로그인</h1>
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
                  placeholder={TEST_ACCOUNT.email}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4자리 숫자"
                />
              </div>
              {error && <p className="text-sm text-destructive">이메일 또는 비밀번호가 올바르지 않아요.</p>}
              <Button type="submit">로그인</Button>
              <p className="text-center text-xs text-muted-foreground">
                테스트 계정: {TEST_ACCOUNT.email} / {TEST_ACCOUNT.password}
              </p>
              <p className="text-center text-xs text-muted-foreground">
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
