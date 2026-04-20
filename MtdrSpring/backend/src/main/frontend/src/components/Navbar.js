import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navbar(props) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    props.setIsAuth(false);
    navigate('/');
  };

  const navButtonStyle = {
    color: scrolled ? '#ffffff' : '#3C4545',
    textTransform: 'uppercase',
    fontWeight: 500,
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    mx: 1,
    '&:hover': {
      color: '#000000',
      backgroundColor: scrolled ? '#F1EFED' : 'transparent',
      boxShadow: scrolled ? 'none' : '0 2px 10px #00000033',
      transition: 'color 0.3s ease',
    },
  };

  return (
    // WRAPPER que centra correctamente
    <Box
      sx={{
        position: 'fixed',
        top: scrolled ? '10px' : '0px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          width: scrolled ? '95%' : '100%',

          backgroundColor: scrolled ? '#c74534db' : '#F1EFED',
          //backgroundColor: scrolled ? '#F1EFED' : '#c74534af',
          backdropFilter: scrolled ? 'blur(5px)' : 'none',

          borderRadius: scrolled ? '50px' : '0px',
          //border: scrolled ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',

          //transition: 'all 0.35s ease-in-out',
          transition: scrolled 
            ? 'all 0.5s ease-in-out' // Transición hacia el estado cápsula (más lenta)
            : 'all 0.3s ease-in-out',

          px: 2,
          py: scrolled ? 1.2 : 1.5,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          {/* Logo */}
          <Box
            sx={{
              backgroundColor: '#F1EFED',
              px: 2,
              py: 0.5,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              height: '32px',
              boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg"
              alt="Oracle Logo"
              style={{ height: '14px' }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button sx={navButtonStyle} onClick={() => navigate('/Dashboard')}>
              Dashboard
            </Button>

            <Button sx={navButtonStyle} onClick={() => navigate('/DashDevs')}>
              Assets
            </Button>

            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                ...navButtonStyle,
                borderColor: 'rgba(241, 239, 237, 0.3)',
                borderRadius: '20px',
                px: 3,
                ml: 2,
              }}
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