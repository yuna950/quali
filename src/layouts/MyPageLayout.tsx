import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/mypage', label: '나의 자격증', end: true },
  { to: '/mypage/records', label: '응시기록' },
  { to: '/mypage/interests', label: '관심 자격증' },
  { to: '/mypage/settings', label: '설정' },
]

export function MyPageLayout() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-6 flex gap-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `pb-3 text-sm font-medium ${
                isActive
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
