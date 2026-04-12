import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
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
  const [verifyMessage, setVerifyMessage] = useState(null)

  useEffect(() => {
    // Cek URL path dulu — kalau /reset-password langsung ke sana
    const path = window.location.pathname
    if (path === '/reset-password') {
      setCurrentView('reset-password')
      return
    }

    // Handle token verifikasi email dari hash
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const type = params.get('type')

      if (type === 'signup' || type === 'email_change') {
        setVerifyMessage('Email berhasil diverifikasi! Silakan login.')
        setCurrentView('login')
        window.history.replaceState(null, '', window.location.pathname)
        return
      }
    }

    // Satu listener untuk semua auth events — termasuk INITIAL_SESSION saat page load/refresh
    // Ini menggantikan checkSession agar tidak ada race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Dipanggil sekali saat app pertama load — ada session = sudah login, tidak ada = landing
        if (session) {
          localStorage.setItem('token', session.access_token)
          setCurrentView('home')
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setCurrentView('landing')
        }
        return
      }

      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('token', session.access_token)
        setCurrentView('home')
        return
      }

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setCurrentView('landing')
        return
      }

      if (event === 'TOKEN_REFRESHED' && session) {
        localStorage.setItem('token', session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
  if (currentView === 'reset-password')  return <ResetPassword onNavigate={setCurrentView} />
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