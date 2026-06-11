import { useState } from 'react' // <-- 1. Importamos useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toolbar, Box } from '@mui/material'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import DashDevs from '../pages/DashDevs'
import Navbar from '../components/Navbar'
import Sprints from '../pages/Sprints'
import Roadmap from '../pages/RoadMap'
import Desarrolladores from '../pages/Desarrolladores'
import Cambios from '../pages/Cambios'

function AppRouter({ isAuth, setIsAuth, user, setUser, selectedProjectId, setSelectedProjectId }) {

  const [sprintFilter, setSprintFilter] = useState('all')

  return (
    <BrowserRouter>

      {isAuth && (
        <Navbar 
          setIsAuth={setIsAuth} 
          setUser={setUser} 
          user={user} 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          sprintFilter={sprintFilter}
          setSprintFilter={setSprintFilter}
        />
      )}

      <Box>
        {isAuth && <Toolbar />}

        <Routes>
          <Route
            path="/"
            element={
              isAuth
                ? <Navigate to={user?.roleName === 'Manager' ? "/Sprints" : "/dashboard"} />
                : <Login setIsAuth={setIsAuth} setUser={setUser} />
            }
          />
          <Route 
            path="/dashboard" 
            element={
              isAuth && ['Leader', 'Administrador'].includes(user?.roleName)
                ? <Dashboard selectedProjectId={selectedProjectId} sprintFilter={sprintFilter} />
                : <Navigate to={isAuth ? (user?.roleName === 'Manager' ? "/Sprints" : "/DashDevs") : "/"} />
            }
          />
          <Route
            path="/DashDevs"
            element={
              isAuth && ['Developer'].includes(user?.roleName)
                ? <DashDevs 
                    user={user} 
                    selectedProjectId={selectedProjectId} 
                    sprintFilter={sprintFilter} 
                    setSprintFilter={setSprintFilter} 
                  />
                : <Navigate to="/dashboard" />
            }
          />
          <Route 
            path="/Sprints" 
            element={
              isAuth && ['Manager', 'Leader', 'Administrador'].includes(user?.roleName)
                ? <Sprints selectedProjectId={selectedProjectId} />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />
          <Route 
            path="/Roadmap" 
            element={
              isAuth && ['Manager', 'Leader', 'Administrador'].includes(user?.roleName)
                ? <Roadmap selectedProjectId={selectedProjectId} />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />
          <Route 
            path="/Desarrolladores" 
            element={
              isAuth && ['Manager', 'Leader', 'Administrador'].includes(user?.roleName)
                ? <Desarrolladores selectedProjectId={selectedProjectId} />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />
          <Route 
            path="/Cambios" 
            element={
              isAuth && ['Manager', 'Leader', 'Administrador'].includes(user?.roleName)
                ? <Cambios selectedProjectId={selectedProjectId} />
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