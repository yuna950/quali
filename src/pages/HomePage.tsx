import { HeroSection } from '@/components/home/HeroSection'
import { InterestFieldCertificates } from '@/components/home/InterestFieldCertificates'
import { MyExamHero } from '@/components/home/MyExamHero'
import { UpcomingExamScheduleWeek } from '@/components/home/UpcomingExamScheduleWeek'
import { useAuth } from '@/lib/auth'

export function HomePage() {
  const { isLoggedIn } = useAuth()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6">
      {isLoggedIn ? (
        <>
          <MyExamHero />
          <InterestFieldCertificates />
        </>
      ) : (
        <HeroSection />
      )}
      <UpcomingExamScheduleWeek />
    </div>
  )
}
