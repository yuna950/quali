import { InterestFieldCertificates } from '@/components/home/InterestFieldCertificates'
import { MyExamHero } from '@/components/home/MyExamHero'
import { UpcomingExamScheduleWeek } from '@/components/home/UpcomingExamScheduleWeek'

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6">
      <MyExamHero />
      <InterestFieldCertificates />
      <UpcomingExamScheduleWeek />
    </div>
  )
}
