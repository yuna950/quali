import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 달라요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }

    setError('')
    setIsSubmitting(true)
    const result = await signup(email, password, name.trim())
    setIsSubmitting(false)

    if (result.error) {
      if (result.error.includes('already registered')) {
        setError('이미 가입된 이메일이에요.')
      } else if (result.error.includes('rate limit')) {
        setError('이메일 발송 한도를 넘었어요. 잠시 후 다시 시도해주세요.')
      } else {
        setError('회원가입에 실패했어요.')
      }
      return
    }

    if (result.needsEmailConfirmation) {
      toast.success('가입 확인 메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요.')
      navigate('/login')
      return
    }

    toast.success('회원가입을 완료했어요.')
    navigate('/')
  }

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="heading-2 mb-6">회원가입</h1>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">이름</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
              </div>
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
                  placeholder="6자 이상"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password-confirm">비밀번호 확인</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              {error && <p className="desc-4 text-status-red">{error}</p>}
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                회원가입
              </Button>
              <p className="desc-5 text-center text-muted-foreground">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-brand hover:underline">
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
