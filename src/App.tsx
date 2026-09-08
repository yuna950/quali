import { RouterProvider } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './lib/auth'
import { router } from './routes/router'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  )
}

export default App
