import './App.css';
import { useState } from 'react'
import AppRouter from './routes/AppRouter'
import { createTheme, ThemeProvider } from '@mui/material/styles'
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
})
// import './Assets/styles.css'

function App() {

  const [isAuth, setIsAuth] = useState(
    localStorage.getItem('isAuth') === 'true'
  )
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  return (
    <ThemeProvider theme={theme}>
    <AppRouter
      isAuth={isAuth}
      setIsAuth={setIsAuth}
      user={user}
      setUser={setUser}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
    />
    </ThemeProvider>
  )
}

export default App;
