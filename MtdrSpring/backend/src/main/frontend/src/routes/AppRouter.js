import { useState } from 'react' // <-- 1. Importamos useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toolbar, Box } from '@mui/material'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import DashDevs from '../pages/DashDevs'
import Navbar from '../components/Navbar'
import Sprints from '../pages/Sprints'
import TaskCreator from '../pages/TaskCreator'
import Roadmap from '../pages/Roadmap'
import Desarrolladores from '../pages/Desarrolladores'
import Cambios from '../pages/Cambios'

function AppRouter({ isAuth, setIsAuth, user, setUser, selectedProjectId, setSelectedProjectId }) {
  
  // <-- 2. Creamos el estado del filtro de sprints aquí a nivel global de las rutas
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
          // <-- 3. Le pasamos el estado y la función para actualizarlo al Navbar
          sprintFilter={sprintFilter}
          setSprintFilter={setSprintFilter}
        />
      )}

      <Box>
        {/* Esto empuja TODO el contenido debajo del navbar */}
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
                // <-- 4. Le pasamos el valor actual del filtro al Dashboard
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
            path="/TaskCreator" 
            element={
              isAuth && ['Manager', 'Leader', 'Administrador'].includes(user?.roleName)
                ? <TaskCreator selectedProjectId={selectedProjectId} />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
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