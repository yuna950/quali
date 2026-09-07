// Supabase Auth 연동 전까지의 임시 스텁. 연동 시 이 훅의 구현만 교체하면 됨.
export function useAuth() {
  const isLoggedIn = false
  return { isLoggedIn }
}
