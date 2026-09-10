import { CalendarCheck, Search, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: Search, title: '찾고', description: '내 직무에 맞는 자격증을 검색하고 비교해요.' },
  { icon: CalendarCheck, title: '관리하고', description: '접수 일정과 시험일을 캘린더로 한눈에 챙겨요.' },
  { icon: Target, title: '준비하다', description: '응시 결과를 기록하며 다음 목표를 세워요.' },
]

export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-10 py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          자격증을 찾고, 시험을 관리하고,
          <br />
          다음을 준비하다
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          취업을 준비하는 당신을 위한 자격증 일정 관리, QUALI와 함께해요.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link to="/signup" />}>
            회원가입
          </Button>
          <Button nativeButton={false} render={<Link to="/login" />}>
            로그인
          </Button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-2 rounded-lg border border-border p-6">
            <Icon className="size-6 text-brand" />
            <p className="font-bold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
