import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/* ICONOS MUI */
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import '../Assets/styles.css';

function Navbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    props.setIsAuth(false);
    navigate('/');
  };

  // Función para verificar si la ruta es la activa
  const isActive = (path) => location.pathname === path;

  return (
    <Box
      className="navbar-wrapper"
      style={{ top: scrolled ? '10px' : '0px' }}
    >
      <AppBar
        position="static"
        elevation={0}
        className={`navbar-appbar ${scrolled ? 'scrolled' : ''}`}
        sx={{
          py: scrolled ? 1.2 : 1.4,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* LOGO */}
          <Box className={`navbar-logo-container ${scrolled ? 'scrolled' : ''}`}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg"
              alt="Oracle Logo"
              style={{ height: '14px' }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* BOTONES */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            {/* HELP */}
            <Button
              className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''}`}
              onClick={() =>
                window.open(
                  'https://youtu.be/Z4tsxrheEJw?si=oZrfUPq_412usZTf',
                  '_blank'
                )
              }
            >
              <span className="icon">
                <HelpOutlineIcon fontSize="small" />
              </span>
              <span className="label">???</span>
            </Button>

            {/* DASHBOARD */}
            <Button
              className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <span className="icon">
                <DashboardIcon fontSize="small" />
              </span>
              <span className="label">Dashboard</span>
            </Button>

            {/* GESTION DE TAREAS */}
            <Button
              className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/gestion') ? 'active' : ''}`}
              onClick={() => navigate('/gestion')}
            >
              <span className="icon">
                <AppRegistrationIcon fontSize="small" />
              </span>
              <span className="label">Gestion</span>
            </Button>


            {/* DEVELOPERS */}
            <Button
              className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/DashDevs') ? 'active' : ''}`}
              onClick={() => navigate('/DashDevs')}
            >
              <span className="icon">
                <CodeIcon fontSize="small" />
              </span>
              <span className="label">Developers</span>
            </Button>

            {/* ADD DEVELOPERS */}
            <Button
              className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/AddDevs') ? 'active' : ''}`}
              onClick={() => navigate('/AddDevs')}
            >
              <span className="icon">
                <AssignmentIndIcon fontSize="small" />
              </span>
              <span className="label">Registrar</span>
            </Button>


            {/* LOGOUT */}
            <Button
              onClick={handleLogout}
              className={`nav-button nav-button-logout icon-btn ${scrolled ? 'scrolled' : ''}`}
            >
              <span className="icon">
                <LogoutIcon fontSize="small" />
              </span>
              <span className="label">Logout</span>
            </Button>

          </Box>

        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;