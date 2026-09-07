import { useParams } from 'react-router-dom'

export function CertificateDetailPage() {
  const { jmCd } = useParams<{ jmCd: string }>()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">CertificateDetailPage</h1>
      <p className="text-gray-500">jmCd: {jmCd}</p>
    </div>
  )
}
