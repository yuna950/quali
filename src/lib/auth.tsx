import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { AuthUser } from '@/types/user'

export interface AuthResult {
  error?: string
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  isLoading: boolean
  signup: (email: string, password: string, name: string) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  updateName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(supabaseUser: User | null | undefined): AuthUser | null {
  if (!supabaseUser?.email) return null
  const name = supabaseUser.user_metadata?.name
  return { email: supabaseUser.email, name: typeof name === 'string' && name ? name : supabaseUser.email }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toAuthUser(session?.user))
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signup(email: string, password: string, name: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error) return { error: error.message }
    if (!data.session) return { needsEmailConfirmation: true }
    return {}
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  async function updateName(name: string): Promise<void> {
    const { data, error } = await supabase.auth.updateUser({ data: { name } })
    if (!error) setUser(toAuthUser(data.user))
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, signup, login, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
