import './App.css';
import { useState } from 'react'
import AppRouter from './routes/AppRouter'

function App() {

  const [isAuth, setIsAuth] = useState(false)
  return (
    <AppRouter isAuth={isAuth} setIsAuth={setIsAuth} />
  )
}

export default App;
