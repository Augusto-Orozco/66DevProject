import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, CircularProgress, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import CachedIcon from '@mui/icons-material/Cached';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

import Footer from '../components/Footer'
import '../Assets/styles.css'

function DashDevs({ user, selectedProjectId, sprintFilter, setSprintFilter }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [sprintTasksIds, setSprintTasksIds] = useState([])

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [changesDescription, setChangesDescription] = useState('');
  const [hours, setHours] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTasks = useCallback(() => {
    if (!user?.userId) return
    setLoading(true)
    fetch(`/tasks/user/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching tasks:", err)
        setLoading(false)
      })
  }, [user?.userId])

  const handleOpenDialog = (task) => {
    const currentStatus = (task.status?.status || '').trim().toLowerCase();
    if (currentStatus === 'completado') {
        return; 
    }
    
    setSelectedTask(task);
    if (currentStatus === 'en progreso') {
        setNewStatus('En Progreso');
    } else {
        setNewStatus('');
    }
    setChangesDescription(task.resolutionNote || '');
    setHours(task.realTime || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
    setHours('');
  };

  const handleUpdateStatus = () => {
    if (!selectedTask || !newStatus) {
        alert("Por favor seleccione un estado");
        return;
    }

    if (newStatus === 'Completado' && (!hours || !changesDescription)) {
        alert("Por favor ingrese las horas y la descripción de la resolución");
        return;
    }

    setUpdating(true);
    fetch(`/tasks/${selectedTask.taskId}/status-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        statusName: newStatus,
        changes: newStatus === 'Completado' ? changesDescription : `Cambio de estado a ${newStatus}`,
        realTime: newStatus === 'Completado' ? parseInt(hours) : null
      })
    })
    .then(res => {
      if (res.ok) {
        fetchTasks();
        handleCloseDialog();
      } else {
        alert("Error al actualizar el estado");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error de conexión");
    })
    .finally(() => setUpdating(false));
  };

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, selectedProjectId])

  useEffect(() => {
    if (sprintFilter === 'all' || !sprintFilter) {
      setSprintTasksIds([])
    } else {
      setLoading(true)
      fetch(`/sprintTasks/${sprintFilter}`)
        .then(res => res.json())
        .then(data => {
          const ids = data.map(st => st.task?.taskId || st.taskId)
          setSprintTasksIds(ids)
          setLoading(false)
        })
        .catch(err => {
          console.error("Error:", err)
          setLoading(false)
        })
    }
  }, [sprintFilter])

  const activeTasks = useMemo(() => {
    const tasksOfProject = items.filter(t => 
      (t.projectId === selectedProjectId) || (t.project?.projectId === selectedProjectId)
    );
    
    let filteredTasks = tasksOfProject;
    if (sprintFilter !== 'all' && sprintFilter) {
      filteredTasks = tasksOfProject.filter(t => sprintTasksIds.includes(t.taskId));
    }

    // Ordenar por estatus: Atrasado > En Progreso > Completado > Otros
    const getPriority = (status) => {
      const s = String(status || '').trim().toLowerCase();
      if (s === 'atrasado') return 1;
      if (s === 'en progreso') return 2;
      if (s === 'completado') return 3;
      return 4; // SIN ESTATUS u otros
    };

    return [...filteredTasks].sort((a, b) => {
      const priorityA = getPriority(a.status?.status);
      const priorityB = getPriority(b.status?.status);
      return priorityA - priorityB;
    });
  }, [items, sprintFilter, sprintTasksIds, selectedProjectId]);

  const chartData = useMemo(() => {
    let completadas = 0, pendientes = 0, enProgreso = 0, estimado = 0, real = 0;

    activeTasks.forEach(task => {
      const status = String(task.status?.status || '').trim().toLowerCase();
      if (status === 'completado') completadas += 1;
      else if (status === 'en progreso') enProgreso += 1;
      else pendientes += 1;

      estimado += (task.objetiveTime || 0);
      real += (task.realTime || 0);
    });

    
    let porcentajeReal = real > 0 ? Math.round((estimado / real) * 100) : 0;
    
    
    let colorProd = '#ef5350'; 
    
    if (porcentajeReal > 75) {
      colorProd = '#4caf50'; 
    } else if (porcentajeReal >= 50) {
      colorProd = '#fbc02d'; 
    }

    return {
      qty: [{ name: 'Tareas', completadas, enProgreso, pendientes }],
      hours: [{ name: 'Horas', estimado, real, productividadLabel: `${porcentajeReal}% Prod.` }],
      prod: { porcentaje: porcentajeReal, color: colorProd, estimado, real }
    };
  }, [activeTasks]);

  return (
    <>
      <Box sx={{ pt: 4, px: 3, pb: 4, maxWidth: '100%', margin: '0 auto' }}>
        
        <Box className="devs-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          
          {/* CUADRO DE TAREAS */}
          <Box className="base-card" sx={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column', height: '650px', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Mis Tareas</Typography>
              <IconButton size="small" onClick={fetchTasks} disabled={loading}>
                <CachedIcon fontSize="small"/>
              </IconButton>
            </Box>

            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
              {activeTasks.map(item => {
                const status = String(item.status?.status || '').trim().toLowerCase();
                let borderColor = '#9e9e9e'; // Default grey
                if (status === 'atrasado') borderColor = '#ef5350'; // Red
                else if (status === 'en progreso') borderColor = '#fbc02d'; // Yellow
                else if (status === 'completado') borderColor = '#4caf50'; // Green

                return (
                  <Box 
                    key={item.taskId} 
                    className="devs-task-card" 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenDialog(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenDialog(item);
                      }
                    }}
                    aria-label={`Actualizar estado de: ${item.title}`}
                    sx={{ 
                      borderLeft: `6px solid ${borderColor}`, 
                      p: 1.5, mb: 1.5, bgcolor: 'background.paper', borderRadius: '0 8px 8px 0',
                      cursor: status === 'completado' ? 'default' : 'pointer',
                      opacity: status === 'completado' ? 0.8 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: status === 'completado' ? 'none' : 'translateY(-2px)',
                        boxShadow: status === 'completado' ? 'none' : '0 4px 8px rgba(0,0,0,0.1)'
                      },
                      '&:active': {
                        transform: status === 'completado' ? 'none' : 'scale(0.98)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {status === 'completado' ? (item.resolutionNote || item.description) : item.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* GRÁFICA TOTAL DE TAREAS */}
          <Box className="base-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Total de Tareas</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={chartData.qty} margin={{ top: 5, right: 40, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="completadas" name="Completadas" fill="#4caf50" stackId="a" barSize={45} />
                <Bar dataKey="enProgreso" name="En Progreso" fill="#fbc02d" stackId="a" barSize={45} />
                <Bar dataKey="pendientes" name="Pendientes" fill="#9e9e9e" stackId="a" barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* PRODUCTIVIDAD ACTUALIZADA */}
          <Box className="base-card" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ width: '100%', mb: 1 }}>Productividad</Typography>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                <CircularProgress 
                    variant="determinate" 
                    value={chartData.prod.porcentaje > 100 ? 100 : chartData.prod.porcentaje} 
                    size={130} 
                    thickness={5} 
                    sx={{ color: chartData.prod.color }} 
                />
                <Typography variant="h4" sx={{ position: 'absolute', fontWeight: 'bold' }}>
                    {chartData.prod.porcentaje}%
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                Estimadas: {chartData.prod.estimado}h | Reales: {chartData.prod.real}h
            </Typography>
          </Box>

          {/* COMPARATIVA HORAS */}
          <Box className="base-card" sx={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Comparativa: Horas Estimadas vs Reales</Typography>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart layout="vertical" data={chartData.hours} margin={{ top: 10, right: 100, left: 20, bottom: 20 }} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="estimado" name="Horas Estimadas" fill="#42a5f5" barSize={35}>
                    <LabelList dataKey="estimado" position="right" offset={10} style={{ fontSize: 12, fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="real" name="Horas Reales" fill="#ef5350" barSize={35}>
                    
                    <LabelList dataKey="productividadLabel" position="right" offset={10} style={{ fontSize: 12, fontWeight: 'bold', fill: '#333' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

        </Box>
      </Box>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Actualizar Estado de Tarea</DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedTask.title}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={newStatus}
                  label="Estado"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="En Progreso">En Progreso</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                </Select>
              </FormControl>

              {newStatus === 'Completado' && (
                <>
                  <TextField
                    fullWidth
                    label="Horas trabajadas"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Horas"
                    required
                  />
                  <TextField
                    fullWidth
                    label="¿Qué se hizo para resolver la tarea?"
                    multiline
                    rows={4}
                    value={changesDescription}
                    onChange={(e) => setChangesDescription(e.target.value)}
                    placeholder="Describe brevemente los cambios o la resolución"
                    inputProps={{ maxLength: 200 }}
                    helperText={`${(changesDescription || '').length}/200`}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            disabled={updating || !newStatus || (newStatus === 'Completado' && (!hours || !changesDescription))}
            sx={{ bgcolor: 'var(--oracle-red)', '&:hover': { bgcolor: 'var(--oracle-red-hover)' } }}
          >
            {updating ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </>
  ) 
}

export default DashDevs;