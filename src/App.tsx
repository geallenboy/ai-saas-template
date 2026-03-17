import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GlobalProviders } from '@/components/common/global-providers'
import { HomePage } from '@/components/home'
import { NotFoundPage } from '@/pages/not-found-page'

export default function App() {
  return (
    <GlobalProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GlobalProviders>
  )
}
