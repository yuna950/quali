import type { PassRateSummary } from '@/types/certificate'

export function PassRateTable({ summary }: { summary: PassRateSummary }) {
  const columns = [...summary.years.map((y) => ({ label: `${y.year}년`, value: `${y.passRate}%` })), {
    label: `${summary.years.length}년 평균`,
    value: `${summary.averageRate}%`,
  }]

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">합격률</h2>
      <div className="grid overflow-hidden rounded-xl border border-border" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((col) => (
          <div key={col.label} className="border-b border-l border-border py-3 text-center text-sm font-bold first:border-l-0">
            {col.label}
          </div>
        ))}
        {columns.map((col) => (
          <div key={col.label} className="border-l border-border py-4 text-center text-sm first:border-l-0">
            {col.value}
          </div>
        ))}
      </div>
    </section>
  )
}
