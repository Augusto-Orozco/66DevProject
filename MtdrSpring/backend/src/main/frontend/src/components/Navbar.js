import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/* ICONOS MUI */
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import '../Assets/styles.css';

function Navbar(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Estado para el selector de proyectos
  const [anchorElProject, setAnchorElProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const openProject = Boolean(anchorElProject);

  // Estado para el menú de Sprints
  const [anchorElSprint, setAnchorElSprint] = useState(null);
  const [sprints, setSprints] = useState([]);
  const openSprint = Boolean(anchorElSprint);

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
            // ordenar de manera ascendente
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

  //Sprint id para tener su numero de sprint
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

  // Controladores Proyecto
  const handleClickProject = (event) => {
    setAnchorElProject(event.currentTarget);
  };

  const handleCloseProject = (project) => {
    if (project) {
      props.setSelectedProjectId(project.projectId);
      if (props.setSprintFilter) {
        props.setSprintFilter('all');
      }
    }
    setAnchorElProject(null);
  };

  // Controladores Sprint
  const handleClickSprint = (event) => {
    setAnchorElSprint(event.currentTarget);
  };

  const handleCloseSprint = (sprintId) => {
    if (sprintId !== undefined && props.setSprintFilter) {
    
      props.setSprintFilter(sprintId);
    }
    setAnchorElSprint(null);
  };

  const isActive = (path) => location.pathname === path;

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

          {/* SECCIÓN DERECHA: FILTROS Y LOGOUT */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 1 }}>

            {/* FILTRO DE SPRINT */}
            {isActive('/dashboard') && (
              <>
                <Button
                  className={`nav-button icon-btn no-grow ${scrolled ? 'scrolled' : ''}`}
                  onClick={handleClickSprint}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{ mr: 1 }}
                >
                  <span className="icon"><CalendarTodayIcon fontSize="small" /></span>
                  <span className="label">{selectedSprintName}</span>
                </Button>
                <Menu
                  anchorEl={anchorElSprint}
                  open={openSprint}
                  onClose={() => handleCloseSprint()}
                  PaperProps={{
                    style: {
                      borderRadius: '12px',
                      marginTop: '8px',
                      minWidth: '180px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => handleCloseSprint('all')}
                    selected={props.sprintFilter === 'all' || !props.sprintFilter}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    Todos los Sprints
                  </MenuItem>
                  {sprints.map((sprint) => (
                    <MenuItem 
                      key={sprint.sprintId} 
                    
                      onClick={() => handleCloseSprint(sprint.sprintId)}
                      selected={sprint.sprintId === props.sprintFilter} 
                      sx={{ fontSize: '0.85rem' }}
                    >
                      {/* Pero al usuario le mostramos el nombre o el número amigable */}
                      {sprint.sprintName || `Sprint ${sprint.sprintNum}`}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {/* SELECTOR DE PROYECTOS */}
            <Button
              className={`nav-button icon-btn no-grow ${scrolled ? 'scrolled' : ''}`}
              onClick={handleClickProject}
              endIcon={<ArrowDropDownIcon />}
            >
              <span className="icon"><AccountTreeIcon fontSize="small" /></span>
              <span className="label">{selectedProjectName}</span>
            </Button>
            <Menu
              anchorEl={anchorElProject}
              open={openProject}
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
                  key={project.projectId} 
                  onClick={() => handleCloseProject(project)}
                  selected={project.projectId === props.selectedProjectId}
                  sx={{ fontSize: '0.85rem' }}
                >
                  {project.name}
                </MenuItem>
              ))}
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