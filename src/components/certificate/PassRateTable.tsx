import type { PassRateSummary } from '@/types/certificate'

export function PassRateTable({ summary }: { summary: PassRateSummary }) {
  const columns = [...summary.years.map((y) => ({ label: `${y.year}년`, value: `${y.passRate}%` })), {
    label: `${summary.years.length}년 평균`,
    value: `${summary.averageRate}%`,
  }]

  return (
    <section>
      <h2 className="heading-3 mb-3">합격률</h2>
      <div className="grid overflow-hidden rounded-xl border border-border" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((col) => (
          <div key={col.label} className="border-b border-l border-border py-3 text-center text-sm font-bold first:border-l-0">
            {col.label}
          </div>
        ))}
        {columns.map((col) => (
          <div key={col.label} className="desc-4 border-l border-border py-4 text-center first:border-l-0">
            {col.value}
          </div>
        ))}
      </div>
    </section>
  )
}
