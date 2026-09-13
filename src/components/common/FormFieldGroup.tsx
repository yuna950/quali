import type { ReactNode } from 'react'

interface FormFieldGroupProps {
  title?: string
  children: ReactNode
}

/** '나의 시험 추가'/'응시기록 추가' 다이얼로그가 공유하는 필드 그룹 단위 — 그룹 내부는 촘촘하게, 그룹 사이는 넓게 */
export function FormFieldGroup({ title, children }: FormFieldGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {title && <p className="desc-5 font-semibold text-muted-foreground">{title}</p>}
      {children}
    </div>
  )
}
