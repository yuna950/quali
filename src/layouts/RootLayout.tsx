import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
