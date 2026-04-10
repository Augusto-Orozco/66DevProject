import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import Navbar from '../components/Navbar'

function AppRouter({ isAuth, setIsAuth }) {
  return (
    <BrowserRouter>

      {isAuth && <Navbar setIsAuth={setIsAuth} />}

      <Routes>
        <Route path="/" element={<Login setIsAuth={setIsAuth} />} />

        <Route 
          path="/dashboard" 
          element={isAuth ? <Dashboard /> : <Navigate to="/" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </BrowserRouter>
  )
}

export default AppRouter