import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button, IconButton } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CachedIcon from '@mui/icons-material/Cached';
import { 
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

import Footer from '../components/Footer'
import '../Assets/styles.css'

function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTasks = () => {
    setLoading(true)
    fetch('/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor')
        return res.json()
      })
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(error => {
        setError(error.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Agrupar tareas por status
  const statusCount = items.reduce((acc, item) => {
    const status = item.status?.status || 'SIN ESTATUS'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.keys(statusCount).map(key => {
    let color = '#9e9e9e'
    if (key === 'COMPLETADO') color = '#4caf50'
    else if (key === 'EN PROGRESO') color = '#fbc02d'
    else if (key === 'Finish') color = '#f44336'
    return { name: key, value: statusCount[key], fill: color }
  })

  const completionRateData = [
    { name: 'Completadas', value: 18, fill: '#4caf50' },
    { name: 'Pendientes', value: 7, fill: '#fbc02d' }
  ]
  const sprintProgressData = [
    { name: 'Sprint', completado: 70, restante: 30 }
  ]

  return (
    <>
    <Box className="dashboard-grid">
      
      {/* --- Metricas --- */}
      <Box className="base-card">
        <strong>Total Tareas</strong>
        {loading ? <CircularProgress size={20} sx={{ mt: 1 }} /> : <h2>{items.length}</h2>}
      </Box>

      <Box className="base-card">
        <Typography variant="h6" sx={{ mb: 1 }}>Estado de Tareas</Typography>
        {loading ? <CircularProgress /> : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box className="base-card">
        <Typography variant="h6">Tasa de Finalización</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={completionRateData} dataKey="value" nameKey="name" outerRadius={70} />
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box className="base-card">
        <Typography variant="h6">Progreso del Sprint</Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>70%</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sprintProgressData} layout="vertical">
            <XAxis type="number" hide /><YAxis type="category" dataKey="name" hide /><Tooltip />
            <Bar dataKey="completado" stackId="a" fill="#4caf50" />
            <Bar dataKey="restante" stackId="a" fill="#e0e0e0" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* --- SEGUNDA FILA --- */}
      <Box className="base-card" sx={{ gridColumn: 'span 2' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Desviación Estimado vs Real (Horas)</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[{ tarea: 'Login', estimado: 2, real: 3 }, { tarea: 'API Tasks', estimado: 3, real: 2 }, { tarea: 'Dashboard', estimado: 4, real: 5 }, { tarea: 'Fix Bugs', estimado: 2, real: 4 }]}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="tarea" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="estimado" fill="#42a5f5" name="Horas Estimadas" /><Bar dataKey="real" fill="#ef5350" name="Horas Reales" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box className="base-card">Alertas</Box>
      <Box className="base-card">Filtros</Box>

      {/* --- LISTA --- */}
      <Box className="base-card" sx={{ gridColumn: 'span 4', alignItems: 'flex-start', justifyContent: 'flex-start', p: 3 }}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Listado de Tareas</Typography>
          {/* <Button size="small" variant="outlined" startIcon={<CachedIcon/>} onClick={fetchTasks} disabled={loading}></Button> */}
          <IconButton size="small" onClick={fetchTasks} disabled={loading}><CachedIcon /></IconButton>
        </Box>

        {!loading && items.length > 0 && (
          <Box sx={{ display: 'flex', width: '100%', px: 2, mb: 1, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold' }}>TAREA</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>ESTATUS</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}>PRIORIDAD</Typography>
          </Box>
        )}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!loading && items.map((item) => {
            let pCol = '#292929', pBg = '#f5f5f5'
            const priorityName = item.priority?.priorityName;
            if (priorityName === 'High' || priorityName === 'ALTA') { pCol = '#ff002f'; pBg = '#ffd0e0' }
            else if (priorityName === 'Medium' || priorityName === 'MEDIA') { pCol = '#693ff6'; pBg = '#f4edff' }
            else if (priorityName === 'Low' || priorityName === 'BAJA') { pCol = '#2698a2'; pBg = '#bdf2fc' }

            let sCol = '#000000', sBg = '#a9a9a9', border = '#858585'
            const statusStr = item.status?.status;
            if (statusStr === 'COMPLETADO') { sCol = '#123013'; sBg = '#bbffc1'; border = '#4caf50' }
            else if (statusStr === 'EN PROGRESO') { sCol = '#483009'; sBg = '#fff9b9'; border = '#fbc02d' }
            else if (statusStr === 'Finish') { sCol = '#541111'; sBg = '#fdb4bf'; border = '#ff2020' }

            return (
              <Box key={item.taskId} className="task-row" style={{ borderLeft: `6px solid ${border}` }}>
                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <span className="badge-base" style={{ backgroundColor: sBg, color: sCol }}>{statusStr || 'SIN ESTATUS'}</span>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <span className="badge-base" style={{ backgroundColor: pBg, color: pCol }}>{priorityName || 'N/A'}</span>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
    <Footer />
    </>
  )
}

export default Dashboard
