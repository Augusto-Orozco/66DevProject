import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Divider, ListSubheader } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/* ICONOS MUI */
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TuneIcon from '@mui/icons-material/Tune';

import '../Assets/styles.css';

function Navbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Estado para el menú unificado (Proyectos + Sprints)
  const [anchorElUnified, setAnchorElUnified] = useState(null);
  const openUnified = Boolean(anchorElUnified);

  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);

  // Fetch de proyectos
  useEffect(() => {
    fetch('/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0 && !props.selectedProjectId) {
          props.setSelectedProjectId(data[0].projectId);
        }
      })
      .catch(err => console.error("Error fetching projects:", err));
  }, []);

  // Fetch de sprints cada vez que cambia el proyecto seleccionado
  useEffect(() => {
    if (props.selectedProjectId) {
      fetch(`/sprints/project/${props.selectedProjectId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const sortedSprints = [...data].sort((a, b) => a.sprintNum - b.sprintNum);
            setSprints(sortedSprints);
          } else {
            setSprints([]);
          }
        })
        .catch(err => console.error("Error fetching sprints:", err));
    }
  }, [props.selectedProjectId]);

  const selectedProjectName = projects.find(p => p.projectId === props.selectedProjectId)?.name || 'Seleccionar Proyecto';

  const currentSprintObj = sprints.find(s => s.sprintId === props.sprintFilter);
  const selectedSprintName = props.sprintFilter === 'all' || !props.sprintFilter
    ? 'Todos los Sprints'
    : currentSprintObj ? `Sprint ${currentSprintObj.sprintNum}` : 'Todos los Sprints';

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

  const handleClickUnified = (event) => {
    setAnchorElUnified(event.currentTarget);
  };

  const handleCloseUnified = () => {
    setAnchorElUnified(null);
  };

  const handleSelectProject = (project) => {
    props.setSelectedProjectId(project.projectId);
    if (props.setSprintFilter) {
      props.setSprintFilter('all');
    }
    handleCloseUnified();
  };

  const handleSelectSprint = (sprintId) => {
    if (props.setSprintFilter) {
      props.setSprintFilter(sprintId);
    }
    handleCloseUnified();
  };

  const isActive = (path) => location.pathname === path;

  // Determinar si debemos mostrar el selector de sprints en el menú unificado
  const showSprintSelector = !isActive('/Sprints');

  return (
    <Box className="navbar-wrapper" style={{ top: scrolled ? '10px' : '0px' }}>
      <AppBar
        position="static"
        elevation={0}
        className={`navbar-appbar ${scrolled ? 'scrolled' : ''}`}
        sx={{ py: scrolled ? 1.2 : 1.4 }}
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

          {/* SECCIÓN CENTRAL: NAVEGACIÓN */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {props.user?.roleName === 'Product Owner' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                <span className="icon"><DashboardIcon fontSize="small" /></span>
                <span className="label">Dashboard</span>
              </Button>
            )}

            {props.user?.roleName === 'Product Owner' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/Sprints') ? 'active' : ''}`}
                onClick={() => navigate('/Sprints')}
              >
                <span className="icon"><AppRegistrationIcon fontSize="small" /></span>
                <span className="label">Sprints</span>
              </Button>
            )}

            {props.user?.roleName === 'Developer' && (
              <Button
                className={`nav-button icon-btn ${scrolled ? 'scrolled' : ''} ${isActive('/DashDevs') ? 'active' : ''}`}
                onClick={() => navigate('/DashDevs')}
              >
                <span className="icon"><CodeIcon fontSize="small" /></span>
                <span className="label">Developers</span>
              </Button>
            )}
          </Box>

            {/* SECCIÓN DERECHA: UNIFICADO Y LOGOUT */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 1 }}>

            {/* BOTÓN UNIFICADO DE SELECTORES */}
            <Button
              className={`nav-button icon-btn no-grow ${scrolled ? 'scrolled' : ''}`}
              onClick={handleClickUnified}
              endIcon={<ArrowDropDownIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <span className="icon"><TuneIcon fontSize="small" /></span>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 0.5 }}>
                <span className="label" style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1 }}>{selectedProjectName}</span>
                {showSprintSelector && (
                  <span className="label" style={{ fontSize: '0.75rem', fontWeight: 'bold', lineHeight: 1.2 }}>{selectedSprintName}</span>
                )}
              </Box>
            </Button>

            <Menu
              anchorEl={anchorElUnified}
              open={openUnified}
              onClose={handleCloseUnified}
              PaperProps={{
                style: {
                  borderRadius: '12px',
                  marginTop: '8px',
                  minWidth: '220px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxHeight: '400px'
                },
              }}
            >
              <ListSubheader sx={{ fontWeight: 'bold', lineHeight: '32px', color: '#cc0707' }}>
                PROYECTO
              </ListSubheader>
              {projects.map((project) => (
                <MenuItem 
                  key={project.projectId} 
                  onClick={() => handleSelectProject(project)}
                  selected={project.projectId === props.selectedProjectId}
                  sx={{ fontSize: '0.85rem', py: 1 }}
                >
                  <AccountTreeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  {project.name}
                </MenuItem>
              ))}

              {showSprintSelector && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <ListSubheader sx={{ fontWeight: 'bold', lineHeight: '32px', color: '#cc0707' }}>
                    SPRINT
                  </ListSubheader>
                  <MenuItem 
                    onClick={() => handleSelectSprint('all')}
                    selected={props.sprintFilter === 'all' || !props.sprintFilter}
                    sx={{ fontSize: '0.85rem', py: 1 }}
                  >
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    Todos los Sprints
                  </MenuItem>
                  {sprints.map((sprint) => (
                    <MenuItem 
                      key={sprint.sprintId} 
                      onClick={() => handleSelectSprint(sprint.sprintId)}
                      selected={sprint.sprintId === props.sprintFilter} 
                      sx={{ fontSize: '0.85rem', py: 1 }}
                    >
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      {sprint.sprintName || `Sprint ${sprint.sprintNum}`}
                    </MenuItem>
                  ))}
                </>
              )}
            </Menu>

            <Button
              onClick={handleLogout}
              className={`nav-button nav-button-logout icon-btn ${scrolled ? 'scrolled' : ''}`}
            >
              <span className="icon"><LogoutIcon fontSize="small" /></span>
              <span className="label">Logout</span>
            </Button>
          </Box>

        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;