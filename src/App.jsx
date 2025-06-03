import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import AnalyticsDashboard from './components/AnalyticsDashboard'

const notificationService = {
  init() {
    // Initialize notification service
    console.log('Notification service initialized')
  },
  destroy() {
    // Cleanup notification service
    console.log('Notification service destroyed')
  }
}
function App() {
useEffect(() => {
    // Initialize notification service
    notificationService.init()
    
    // Cleanup on unmount
    return () => {
      notificationService.destroy()
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
<Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-50"
        />
      </div>
    </Router>
  )
}

export default App