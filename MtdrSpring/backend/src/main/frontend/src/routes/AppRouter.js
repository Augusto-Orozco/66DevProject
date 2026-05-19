import { useState } from 'react' // <-- 1. Importamos useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toolbar, Box } from '@mui/material'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import DashDevs from '../pages/DashDevs'
import Navbar from '../components/Navbar'
import Sprints from '../pages/Sprints'
import AddDevs from '../pages/AddDevs'
import TaskCreator from '../pages/TaskCreator'

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
                ? <Navigate to="/dashboard" />
                : <Login setIsAuth={setIsAuth} setUser={setUser} />
            }
          />

          <Route 
            path="/dashboard" 
            element={
              isAuth && user?.roleName === 'Product Owner'
                // <-- 4. Le pasamos el valor actual del filtro al Dashboard
                ? <Dashboard selectedProjectId={selectedProjectId} sprintFilter={sprintFilter} />
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
            path="/TaskCreator" 
            element={
              isAuth && user?.roleName === 'Product Owner'
                ? <TaskCreator selectedProjectId={selectedProjectId} />
                : <Navigate to={isAuth ? "/DashDevs" : "/"} />
            }
          />

          <Route 
            path="/Sprints" 
            element={
              isAuth && user?.roleName === 'Product Owner'
                ? <Sprints selectedProjectId={selectedProjectId} />
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