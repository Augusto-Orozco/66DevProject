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

  const [isAuth, setIsAuth] = useState(false)
  return (
    <ThemeProvider theme={theme}>
    <AppRouter isAuth={isAuth} setIsAuth={setIsAuth} />
    </ThemeProvider>
  )
}

export default App;
