import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [selectedClassId, setSelectedClassId] = useState(null)

  useEffect(() => {
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
  if (currentView === 'login')           return <Login onNavigate={setCurrentView} />
  if (currentView === 'register')        return <Register onNavigate={setCurrentView} />
  if (currentView === 'forgot-password') return <ForgotPassword onNavigate={setCurrentView} />
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