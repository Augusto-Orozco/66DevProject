import { useState, useEffect, useMemo } from 'react'
import { Box, CircularProgress, Typography, IconButton } from '@mui/material'
import CachedIcon from '@mui/icons-material/Cached';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

import Footer from '../components/Footer'
import '../Assets/styles.css'

function DashDevs({ user, selectedProjectId, sprintFilter, setSprintFilter }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sprintTasksIds, setSprintTasksIds] = useState([])

  const fetchTasks = () => {
    if (!user?.userId) return
    setLoading(true)
    fetch(`/tasks/user/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTasks()
  }, [user, selectedProjectId])

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
    if (sprintFilter === 'all' || !sprintFilter) return tasksOfProject;
    return tasksOfProject.filter(t => sprintTasksIds.includes(t.taskId));
  }, [items, sprintFilter, sprintTasksIds, selectedProjectId]);

  const chartData = useMemo(() => {
    let completadas = 0, pendientes = 0, enProgreso = 0, estimado = 0, real = 0;

    activeTasks.forEach(task => {
      const status = task.status?.status;
      if (status === 'Completado') completadas += 1;
      else if (status === 'En Progreso') enProgreso += 1;
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
              {activeTasks.map(item => (
                <Box key={item.taskId} className="devs-task-card" sx={{ 
                  borderLeft: `6px solid ${item.status?.status === 'Completado' ? '#4caf50' : item.status?.status === 'En Progreso' ? '#fbc02d' : '#9e9e9e'}`, 
                  p: 1.5, mb: 1.5, bgcolor: 'background.paper', borderRadius: '0 8px 8px 0' 
                }}>
                  <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                </Box>
              ))}
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
      <Footer />
    </>
  ) 
}

export default DashDevs;