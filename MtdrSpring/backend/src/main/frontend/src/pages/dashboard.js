import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, IconButton, FormControl, Select, MenuItem } from '@mui/material'
import CachedIcon from '@mui/icons-material/Cached';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid} from 'recharts'

import Footer from '../components/Footer'
import '../Assets/styles.css'

function Dashboard({ selectedProjectId }) {
  const [summary, setSummary] = useState(null)
  const [items, setItems] = useState([]) // Mantenemos la lista para el listado inferior
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Filtros locales
  const [statusFilter, setStatusFilter] = useState('all')
  const [hoursFilter, setHoursFilter] = useState('all')

  const fetchData = () => {
    if (!selectedProjectId) return;
    
    setLoading(true)
    setError(null)

    // Consolidamos las peticiones: 
    // 1. El SP para las gráficas (procesamiento en la nube)
    // 2. El listado de tareas (para la tabla inferior)
    Promise.all([
      fetch(`/projects/${selectedProjectId}/dashboard-summary`).then(res => res.json()),
      fetch(`/tasks/project/${selectedProjectId}`).then(res => res.json())
    ])
    .then(([summaryData, tasksData]) => {
      setSummary(summaryData)
      setItems(Array.isArray(tasksData) ? tasksData : [])
      setLoading(false)
    })
    .catch(err => {
      console.error("Error cargando dashboard:", err)
      setError("No se pudieron cargar los datos")
      setLoading(false)
    })
  }

  useEffect(() => {
    setStatusFilter('all')
    setHoursFilter('all')
    fetchData()
  }, [selectedProjectId])

  // --- Lógica de Gráficas (Usando el Summary del SP) ---
  
  // 1. Gráfica de Estatus
  const statusChartData = (summary?.statusStats || []).map(stat => {
    let color = '#9e9e9e'
    if (stat.name === 'Completado') color = '#4caf50'
    else if (stat.name === 'En Progreso') color = '#fbc02d'
    else if (stat.name === 'Atrasado') color = '#f44336'
    return { ...stat, fill: color }
  })

  // 2. Gráfica de Horas (Filtrable)
  const devComparisonData = (summary?.devStats || [])
    .filter(dev => hoursFilter === 'all' || dev.name === hoursFilter)
    .map(dev => ({
      name: dev.name,
      estimado: dev.estimado,
      real: dev.real
    }))

  // 3. Tasa de Finalización y Progreso
  const total = summary?.progress?.total || 0
  const completed = summary?.progress?.completed || 0
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  const completionRateData = [
    { name: 'Completadas', value: completed, fill: '#4caf50' },
    { name: 'Pendientes', value: total - completed, fill: '#fbc02d' }
  ]

  const sprintProgressData = [
    { name: 'Sprint', completado: progressPercent, restante: 100 - progressPercent }
  ]

  return (
    <>
    <Box className="dashboard-grid">
      
      {/* --- Metricas --- */}
      <Box className="base-card">
        <strong>Total Tareas</strong>
        {loading ? <CircularProgress size={20} sx={{ mt: 1 }} /> : <h2>{total}</h2>}
      </Box>

      <Box className="base-card">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '100%' }}>
          <Typography variant="h6">Estado de Tareas</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Global</MenuItem>
              {(summary?.devStats || []).map(dev => (
                <MenuItem key={dev.name} value={dev.name} sx={{ fontSize: '0.75rem' }}>
                  {dev.name.split(' ')[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {loading ? <CircularProgress /> : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
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

      {/* --- SEGUNDA FILA --- */}
      <Box className="base-card">
        <Typography variant="h6">Progreso del Sprint</Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{progressPercent}%</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sprintProgressData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" hide /><Tooltip />
            <Bar dataKey="completado" stackId="a" fill="#4caf50" />
            <Bar dataKey="restante" stackId="a" fill="#e0e0e0" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box className="base-card" sx={{ gridColumn: 'span 3' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
          <Typography variant="h6">
            {hoursFilter === 'all' ? 'Comparativa Horas por Desarrollador' : `Horas - ${hoursFilter}`}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={hoursFilter}
              onChange={(e) => setHoursFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos los Devs</MenuItem>
              {(summary?.devStats || []).map(dev => (
                <MenuItem key={dev.name} value={dev.name} sx={{ fontSize: '0.75rem' }}>
                  {dev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={devComparisonData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{fontSize: 10}} /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="estimado" fill="#42a5f5" name="Horas Estimadas" /><Bar dataKey="real" fill="#ef5350" name="Horas Reales" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* --- LISTA --- */}
      <Box className="base-card" sx={{ gridColumn: 'span 4', alignItems: 'flex-start', justifyContent: 'flex-start', p: 3 }}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Listado de Tareas</Typography>
          <IconButton size="small" onClick={fetchData} disabled={loading}><CachedIcon /></IconButton>
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
            if (priorityName === 'High' || priorityName === 'Alta') { pCol = '#541111'; pBg = '#fdb4bf' }
            else if (priorityName === 'Medium' || priorityName === 'Media') { pCol = '#483009'; pBg = '#fff9b9' }
            else if (priorityName === 'Low' || priorityName === 'Baja') { pCol = '#123013'; pBg = '#94e59b' }

            let sCol = '#000000', sBg = '#a9a9a9', border = '#858585'
            const statusStr = item.status?.status;
            if (statusStr === 'Completado') { sCol = '#123013'; sBg = '#94e59b'; border = '#4caf50' }
            else if (statusStr === 'En Progreso') { sCol = '#483009'; sBg = '#fff9b9'; border = '#fbc02d' }
            else if (statusStr === 'Atrasado') { sCol = '#541111'; sBg = '#fdb4bf'; border = '#ff2020' }

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
