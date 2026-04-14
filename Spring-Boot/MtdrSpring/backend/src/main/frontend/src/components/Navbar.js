import { AppBar, Toolbar, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function Navbar(props) {
  const navigate = useNavigate()

  const handleLogout = () => {
    props.setIsAuth(false)
    navigate('/')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#bb4100' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}> </Typography>

        <Button color="inherit" onClick={() => window.open('https://youtu.be/iik25wqIuFo?si=GYn0Ofjlz-kD9mxD', '_blank')}>
          Webito Chopecha
        </Button>
        <Button color="inherit" onClick={() => navigate('/Dashboard')}>
          Dashboard
        </Button>
        {
        <Button color="inherit" onClick={() => navigate('/DashDevs')}>
          Dashboard (Devs)
        </Button>
        }

        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar