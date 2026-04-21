import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toolbar, Box } from '@mui/material'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import DashDevs from '../pages/DashDevs'
import Navbar from '../components/Navbar'
import Gestion from '../pages/gestion'

function AppRouter({ isAuth, setIsAuth }) {
  return (
    <BrowserRouter>

      {isAuth && <Navbar setIsAuth={setIsAuth} />}

      <Box>
        {/* Esto empuja TODO el contenido debajo del navbar */}
        {isAuth && <Toolbar />}

        <Routes>
          <Route path="/" element={<Login setIsAuth={setIsAuth} />} />

          <Route 
            path="/dashboard" 
            element={isAuth ? <Dashboard /> : <Navigate to="/" />} 
          />

          <Route
            path="/DashDevs"
            element={isAuth ? <DashDevs /> : <Navigate to="/" />}
          />

          <Route 
            path="/gestion" 
            element={isAuth ? <Gestion /> : <Navigate to="/" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>

    </BrowserRouter>
  )
}

export default AppRouter