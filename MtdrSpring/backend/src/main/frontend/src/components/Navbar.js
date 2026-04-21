import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../Assets/styles.css';

function Navbar(props) {
  const navigate = useNavigate();
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

  return (
    <Box className="navbar-wrapper" style={{ top: scrolled ? '10px' : '0px' }}>
      <AppBar
        position="static"
        elevation={0}
        className={`navbar-appbar ${scrolled ? 'scrolled' : ''}`}
        sx={{
          py: scrolled ? 1.2 : 1.4,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* Logo */}
          <Box className={`navbar-logo-container ${scrolled ? 'scrolled' : ''}`}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg"
              alt="Oracle Logo"
              style={{ height: '14px' }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <Button 
              className={`nav-button ${scrolled ? 'scrolled' : ''}`} 
              onClick={() =>  window.open('https://youtu.be/Z4tsxrheEJw?si=oZrfUPq_412usZTf', '_blank')}
            >
              (?)
            </Button>

            <Button 
              className={`nav-button ${scrolled ? 'scrolled' : ''}`} 
              onClick={() => navigate('/Dashboard')}
            >
              Dashboard
            </Button>

            <Button 
              className={`nav-button ${scrolled ? 'scrolled' : ''}`} 
              onClick={() => navigate('/DashDevs')}
            >
              Dashboards Developers
            </Button>

            <Button
              variant="outlined"
              onClick={handleLogout}
              className={`nav-button nav-button-logout ${scrolled ? 'scrolled' : ''}`}
            >
              Logout
            </Button>
          </Box>

        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
