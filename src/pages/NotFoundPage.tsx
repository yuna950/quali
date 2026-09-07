import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <Link to="/" className="text-blue-600 underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
