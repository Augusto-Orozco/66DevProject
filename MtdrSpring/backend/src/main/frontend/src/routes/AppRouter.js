import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toolbar, Box } from '@mui/material'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import DashDevs from '../pages/DashDevs'
import Navbar from '../components/Navbar'
import Gestion from '../pages/gestion'
import AddDevs from '../pages/AddDevs'

function AppRouter({ isAuth, setIsAuth, user, setUser }) {
  return (
    <BrowserRouter>

      {isAuth && <Navbar setIsAuth={setIsAuth} setUser={setUser} user={user} />}

      <Box>
        {/* Esto empuja TODO el contenido debajo del navbar */}
        {isAuth && <Toolbar />}

        <Routes>
          <Route
            path="/"
            element={
              isAuth
                ? <Navigate to="/dashboard" />
                : <Login setIsAuth={setIsAuth} setUser={setUser} />
            }
          />

          <Route 
            path="/dashboard" 
            element={
              isAuth && user?.roleName === 'Product Owner'
                ? <Dashboard />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />

          <Route
            path="/DashDevs"
            element={
              isAuth && user?.roleName === 'Developer'
                ? <DashDevs user={user} />
                : <Navigate to="/dashboard" />
            }
          />

          <Route
            path="/AddDevs"
            element={
              isAuth && user?.roleName === 'Product Owner'
                ? <AddDevs />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />

          <Route 
            path="/gestion" 
            element={
              isAuth && user?.roleName === 'Product Owner'
                ? <Gestion />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>

    </BrowserRouter>
  )
}

export default AppRouter
