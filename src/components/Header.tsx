import { CalendarDays, LogOut, Search, UserPlus, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth'

export function Header() {
  const { isLoggedIn, user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/" className="text-xl font-bold text-brand">
        QUALI
      </Link>
      <div className="flex items-center gap-4">
        {isLoggedIn && <span className="text-sm text-muted-foreground">{user?.name}님</span>}

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="마이페이지 메뉴">
            <UserRound className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link to="/mypage" />}>
              <UserRound />
              마이페이지
            </DropdownMenuItem>
            {isLoggedIn ? (
              <DropdownMenuItem onClick={logout}>
                <LogOut />
                로그아웃
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem render={<Link to="/login" />}>
                <UserPlus />
                로그인
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/schedule" aria-label="시험 일정">
          <CalendarDays className="size-5" />
        </Link>

        <Link to="/search" aria-label="검색">
          <Search className="size-5" />
        </Link>
      </div>
    </header>
  )
}
