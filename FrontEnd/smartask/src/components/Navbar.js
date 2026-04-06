import { AppBar, Toolbar, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function Navbar(props) {
  const navigate = useNavigate()

  const handleLogout = () => {
    props.setIsAuth(false)
    navigate('/')
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}> </Typography>

        <Button color="inherit" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        {/*
        <Button color="inherit" onClick={() => navigate('/creador')}>
          Creador
        </Button>
        */}

        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar