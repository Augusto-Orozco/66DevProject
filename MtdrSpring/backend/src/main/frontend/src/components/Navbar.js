import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/* ICONOS MUI */
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import '../Assets/styles.css';

function Navbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Estado para el selector de proyectos
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState('Proyecto Alpha');
  const open = Boolean(anchorEl);

  const projects = ['Proyecto Alpha', 'Proyecto Beta', 'Proyecto Gamma'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuth');
    localStorage.removeItem('user');
    props.setUser(null);
    props.setIsAuth(false);
    navigate('/');
  };

  const handleClickProject = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProject = (project) => {
    if (project && typeof project === 'string') {
      setSelectedProject(project);
    }
    setAnchorEl(null);
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

          {/* SECCIÓN IZQUIERDA: LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box className={`navbar-logo-container ${scrolled ? 'scrolled' : ''}`}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg"
                alt="Oracle Logo"
                style={{ height: '14px' }}
              />
            </Box>
          </Box>

          {/* SECCIÓN CENTRAL: BOTONES DE NAVEGACIÓN */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
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
            {props.user?.roleName === 'Product Owner' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                <span className="icon">
                  <DashboardIcon fontSize="small" />
                </span>
                <span className="label">Dashboard</span>
              </Button>
            )}

            {/* CREAR TAREA */}
            {props.user?.roleName === 'Product Owner' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/TaskCreator') ? 'active' : ''}`}
                onClick={() => navigate('/TaskCreator')}
              >
                <span className="icon">
                  <AppRegistrationIcon fontSize="small" />
                </span>
                <span className="label">Gestión</span>
              </Button>
            )}

            {/* GESTION DE TAREAS */}
            {props.user?.roleName === 'Product Owner' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/Sprints') ? 'active' : ''}`}
                onClick={() => navigate('/Sprints')}
              >
                <span className="icon">
                  <AppRegistrationIcon fontSize="small" />
                </span>
                <span className="label">Sprints</span>
              </Button>
            )}

            {/* DEVELOPERS */}
            {props.user?.roleName === 'Developer' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/DashDevs') ? 'active' : ''}`}
                onClick={() => navigate('/DashDevs')}
              >
                <span className="icon">
                  <CodeIcon fontSize="small" />
                </span>
                <span className="label">Developers</span>
              </Button>
            )}

           {/*} {/* ADD DEVELOPERS */}
            {/*{props.user?.roleName === 'Product Owner' && (*/}
             {/*} <Button*/}
                {/*className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/AddDevs') ? 'active' : ''}`} */}
                {/*onClick={() => navigate('/AddDevs')}*/}
             {/*} >*/}
                {/*<span className="icon">*/}
                {/*  <AssignmentIndIcon fontSize="small" />*/}
                {/*</span>*/}
              {/*  <span className="label">Registrar</span>*/}
            {/*  </Button>*/}
           {/* )}*/}
         </Box>

          {/* SECCIÓN DERECHA: PROYECTOS Y LOGOUT */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>

            {/* SELECTOR DE PROYECTOS (ESTÁTICO, SIN CRECIMIENTO) */}
            <Button
              className={`nav-button icon-btn no-grow ${scrolled ? 'scrolled' : ''}`}
              onClick={handleClickProject}
              endIcon={<ArrowDropDownIcon />}
            >
              <span className="icon">
                <AccountTreeIcon fontSize="small" />
              </span>
              <span className="label">{selectedProject}</span>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleCloseProject()}
              PaperProps={{
                style: {
                  borderRadius: '12px',
                  marginTop: '8px',
                  minWidth: '180px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                },
              }}
            >
              {projects.map((project) => (
                <MenuItem 
                  key={project} 
                  onClick={() => handleCloseProject(project)}
                  selected={project === selectedProject}
                >
                  {project}
                </MenuItem>
              ))}
            </Menu>

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
