import { useState } from 'react'
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import videoBg from '../Assets/BackgroundOracleVid3.mp4'
import logo from '../Assets/OracleLogoWOT.jpeg'
import logo2 from '../Assets/OracleLogoWT.png'
import logo3 from '../Assets/OracleLogoBlack.png'
import logo4 from '../Assets/OracleLogoWhite.png'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'


function Login({ setIsAuth }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    if (email && password) {
      setIsAuth(true)
      navigate('/dashboard')
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
          backgroundColor: 'rgba(237, 154, 154, 0)',
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

        <TextField
          label="Correo electrónico"
          fullWidth
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& label': { color: 'Gray' },
            '& label.Mui-focused': { color: '#ff5722' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'Gray' },
              '&:hover fieldset': { borderColor: '#ff5722' },
              '&.Mui-focused fieldset': { borderColor: '#ff5722' },
            },
          }}
        />
        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& label': { color: 'Gray' },
            '& label.Mui-focused': { color: '#ff5722' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'Gray' },
              '&:hover fieldset': { borderColor: '#ff5722' },
              '&.Mui-focused fieldset': { borderColor: '#ff5722' },
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
          sx={{ width: '200px', display: 'block', mx: 'auto', mt: 4, backgroundColor: '#d26735', '&:hover': { backgroundColor: '#b22323' }}}
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