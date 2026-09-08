import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { seedDemoDataIfNeeded } from '@/services/userService'
import type { AuthUser } from '@/types/user'

const AUTH_STORAGE_KEY = 'quali:auth'

/**
 * Supabase Auth 연동 전까지의 임시 테스트 계정.
 * 연동 시 login()의 내부 구현만 Supabase Auth 호출로 교체하면 됨.
 */
export const TEST_ACCOUNT = {
  email: 'test@quali.com',
  password: '1234',
  name: '테스트 사용자',
}

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [user])

  function login(email: string, password: string): boolean {
    if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      setUser({ email: TEST_ACCOUNT.email, name: TEST_ACCOUNT.name })
      void seedDemoDataIfNeeded()
      return true
    }
    return false
  }

  function logout(): void {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
