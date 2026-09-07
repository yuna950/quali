import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        QUALI
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/search" aria-label="검색">
          검색
        </Link>
        <Link to="/mypage" aria-label="마이페이지">
          마이페이지
        </Link>
      </div>
    </header>
  )
}
