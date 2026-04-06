import { useState } from 'react'
import { TextField, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function Login({ setIsAuth }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // 🔥 Simulación de login (luego aquí va backend)
    if (email && password) {
      setIsAuth(true)
      navigate('/dashboard')
    }
  }

  /*
  const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (data.success) {
      setIsAuth(true)
      navigate('/dashboard')
    }
  } catch (error) {
    console.error(error)
  }
}
*/

  return (
    <Container>
      <h2>Login</h2>

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button variant="contained" fullWidth onClick={handleLogin}>
        Iniciar sesión
      </Button>
    </Container>
  )
}

export default Login