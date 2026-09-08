import { Search, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function Header() {
  const { isLoggedIn, user } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/" className="text-xl font-bold">
        QUALI
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/search" aria-label="검색">
          <Search className="size-5" />
        </Link>
        {isLoggedIn && <span className="text-sm text-muted-foreground">{user?.name}님</span>}
        <Link to="/mypage" aria-label="마이페이지">
          <UserRound className="size-5" />
        </Link>
      </div>
    </header>
  )
}
