import { createBrowserRouter } from 'react-router-dom'
import { MyPageLayout } from '../layouts/MyPageLayout'
import { ProtectedRoute } from '../layouts/ProtectedRoute'
import { RootLayout } from '../layouts/RootLayout'
import { CertificateDetailPage } from '../pages/CertificateDetailPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { InterestsPage } from '../pages/mypage/InterestsPage'
import { MyCertificateRecordPage } from '../pages/mypage/MyCertificateRecordPage'
import { MyCertificatesPage } from '../pages/mypage/MyCertificatesPage'
import { RecordsPage } from '../pages/mypage/RecordsPage'
import { SettingsPage } from '../pages/mypage/SettingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SearchPage } from '../pages/SearchPage'
import { SignupPage } from '../pages/SignupPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'certificates/:jmCd', element: <CertificateDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'mypage',
        element: <ProtectedRoute />,
        children: [
          {
            element: <MyPageLayout />,
            children: [
              { index: true, element: <MyCertificatesPage /> },
              { path: 'records', element: <RecordsPage /> },
              { path: 'interests', element: <InterestsPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
          { path: 'records/:jmCd', element: <MyCertificateRecordPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
