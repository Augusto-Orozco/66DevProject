import { useState } from 'react'
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import videoBg from '../Assets/BackgroundOracleVid8.mp4'
import logo4 from '../Assets/OracleLogoWhite.png'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Footer from '../components/Footer'
import '../Assets/styles.css'

function Login({ setIsAuth }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setError('');
    if (email && password) {
      try {
        const response = await fetch('http://localhost:8080/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
          setIsAuth(true);
          navigate('/dashboard');
        } else if (response.status === 401) {
          setError('Usuario o contraseña incorrectos');
        } else {
          setError('Error en el servidor. Intente más tarde.');
        }
      } catch (err) {
        setError('No se pudo conectar con el servidor.');
      }
    } else {
      setError('Por favor complete todos los campos');
    }
  }

  return (
    <Box className="login-wrapper">

      {/* LOGO */}
      <Box component="img" src={logo4} alt="Logo" className="login-logo" />

      {/* Video */}
      <video autoPlay loop muted playsInline className="login-video">
        <source src={videoBg} type="video/mp4" />
      </video>

      <Box className="login-overlay" />

      {/* LOGIN */}
      <Container maxWidth="xs" className="login-container">
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Iniciar sesión</Typography>

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>{error}</Typography>
        )}

        <TextField
          label="Correo electrónico"
          fullWidth
          margin="normal"
          className="login-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          className="login-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <Button
          className="login-button"
          variant="contained"
          onClick={handleLogin}
        >
          Iniciar sesión
        </Button>
      </Container>

      <Box component="footer" className="login-footer" sx={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', py: 2, color: 'white' }}>
        <Typography variant="body2">© 2026 SmartAsk</Typography>
      </Box>
    </Box>
  )
}

export default Login
