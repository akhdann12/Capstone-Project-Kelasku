import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [resetToken, setResetToken] = useState(null)
  const [verifyMessage, setVerifyMessage] = useState(null)

  useEffect(() => {
    // Handle token dari Supabase di URL hash (#access_token=...&type=...)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const type = params.get('type')
      const accessToken = params.get('access_token')

      if (type === 'recovery' && accessToken) {
        // Link reset password — arahkan ke halaman reset password
        setResetToken(accessToken)
        setCurrentView('reset-password')
        window.history.replaceState(null, '', window.location.pathname)
        return
      }

      if (type === 'signup' && accessToken) {
        // Link verifikasi email — arahkan ke login dengan pesan sukses
        setVerifyMessage('Email berhasil diverifikasi! Silakan login.')
        setCurrentView('login')
        window.history.replaceState(null, '', window.location.pathname)
        return
      }

      if (type === 'email_change' && accessToken) {
        setVerifyMessage('Email berhasil diubah! Silakan login kembali.')
        setCurrentView('login')
        window.history.replaceState(null, '', window.location.pathname)
        return
      }
    }

    // Cek kalau sudah login
    const token = localStorage.getItem('token')
    if (token) setCurrentView('home')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentView('landing')
  }

  const handleOpenClass = (classId) => {
    setSelectedClassId(classId)
    setCurrentView('class-detail')
  }

  if (currentView === 'landing')         return <LandingPage onNavigate={setCurrentView} />
  if (currentView === 'login')           return <Login onNavigate={setCurrentView} successMessage={verifyMessage} />
  if (currentView === 'register')        return <Register onNavigate={setCurrentView} />
  if (currentView === 'forgot-password') return <ForgotPassword onNavigate={setCurrentView} />
  if (currentView === 'reset-password')  return <ResetPassword token={resetToken} onNavigate={setCurrentView} />
  if (currentView === 'calendar')        return <Calendar onBack={() => setCurrentView('home')} onNavigate={setCurrentView} onLogout={handleLogout} />
  if (currentView === 'classes')         return <Classes onNavigate={setCurrentView} onLogout={handleLogout} onOpenClass={handleOpenClass} />
  if (currentView === 'class-detail')    return (
    <ClassDetail
      classId={selectedClassId}
      onBack={() => setCurrentView('classes')}
      onLogout={handleLogout}
    />
  )

  return <Home onNavigate={setCurrentView} onLogout={handleLogout} />
}