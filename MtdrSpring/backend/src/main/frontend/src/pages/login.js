import { useState } from 'react'
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import videoBg from '../Assets/BackgroundOracleVid8.mp4'
import logo4 from '../Assets/OracleLogoWhite.png'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'


function Login({ setIsAuth }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setError(''); // Limpiar errores previos
    if (email && password) {
      try {
        const response = await fetch('http://localhost:8080/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

      {/* LOGO */}
      <Box
        component="img"
        src={logo4}
        alt="Logo"
        sx={{
          position: 'absolute',
          top: 20,
          left: 40,
          width: '120px',
          zIndex: 2
        }}
      />

      {/* Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2,
          transform: 'rotate(180deg) scaleY(-1)'

        }}
      >
        <source src={videoBg} type="video/mp4" />
      </video>

      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(84, 4, 4, 0.53)',
          zIndex: -1
        }}
      />

      {/* LOGIN */}
      <Container
        maxWidth="xs"
        sx={{
          minHeight: '400px',
          mt: 20,
          p: 5,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.94)', 
          boxShadow: 10            
        }}
      >
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>
          Iniciar sesión
        </Typography>

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            {error}
          </Typography>
        )}

        <TextField
          label="Correo electrónico"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& label': { color: '#3c4545' },
            '& label.Mui-focused': { color: '#c74634' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#3c4545' },
              '&:hover fieldset': { borderColor: '#c74634' },
              '&.Mui-focused fieldset': { borderColor: '#c74634' },
            },
          }}
        />
        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& label': { color: '#3c4545' },
            '& label.Mui-focused': { color: '#c74634' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#3c4545' },
              '&:hover fieldset': { borderColor: '#c74634' },
              '&.Mui-focused fieldset': { borderColor: '#c74634' },
            },
          }}
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
          sx={{ width: '200px', display: 'block', mx: 'auto', mt: 4, backgroundColor: '#c74634', '&:hover': { backgroundColor: '#78251a' }}}
          variant="contained"
          onClick={handleLogin}
        >
          Iniciar sesión
        </Button>
      </Container>

      <Box
        component="footer"
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
          py: 2,
          color: 'white',
        }}
      >
        <Typography variant="body2">
          © 2026 SmartAsk
        </Typography>
      </Box>
    </Box>
  )
}

export default Login