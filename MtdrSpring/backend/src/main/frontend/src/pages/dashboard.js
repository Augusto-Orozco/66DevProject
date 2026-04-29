import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CachedIcon from '@mui/icons-material/Cached';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid} from 'recharts'

import Footer from '../components/Footer'
import '../Assets/styles.css'

function Dashboard() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [hoursFilter, setHoursFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/tasks').then(res => res.json()),
      fetch('/users').then(res => res.json()),
      fetch('/tasks/assignments').then(res => res.json())
    ])
    .then(([tasksData, usersData, assignmentsData]) => {
      setItems(tasksData)
      setUsers(usersData)
      setAssignments(assignmentsData)
      setLoading(false)
    })
    .catch(error => {
      setError(error.message)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- Lógica para Gráfica de Estatus ---
  const tasksForStatus = statusFilter === 'all' 
    ? items 
    : assignments
        .filter(a => a.user.userId === statusFilter)
        .map(a => a.task)

  const statusCount = tasksForStatus.reduce((acc, item) => {
    const status = item.status?.status || 'SIN ESTATUS'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusChartData = Object.keys(statusCount).map(key => {
    let color = '#9e9e9e'
    if (key === 'Completado') color = '#4caf50'
    else if (key === 'En Progreso') color = '#fbc02d'
    else if (key === 'Atrasado') color = '#f44336'
    return { name: key, value: statusCount[key], fill: color }
  })

  // --- Lógica para Gráfica de Horas ---
  let devComparisonData = []
  if (hoursFilter === 'all') {
    const devStats = assignments.reduce((acc, a) => {
      const userName = `${a.user.firtsName} ${a.user.lastName}`
      if (!acc[userName]) {
        acc[userName] = { name: userName, estimado: 0, real: 0 }
      }
      acc[userName].estimado += a.task.objetiveTime || 0
      acc[userName].real += a.task.realTime || 0
      return acc
    }, {})
    devComparisonData = Object.values(devStats)
  } else {
    const selectedDev = users.find(u => u.userId === hoursFilter)
    const devName = selectedDev ? `${selectedDev.firtsName} ${selectedDev.lastName}` : ''
    devComparisonData = assignments
      .filter(a => a.user.userId === hoursFilter)
      .map(a => ({
        name: a.task.title, // El tooltip usa 'name' como título. 
        userName: devName,
        estimado: a.task.objetiveTime || 0,
        real: a.task.realTime || 0
      }))
  }

  // --- Listado y Sprint Progress (Usan el total por ahora) ---
  const completionRateData = [
    { name: 'Completadas', value: items.filter(t => t.status?.status === 'Completado').length, fill: '#4caf50' },
    { name: 'Pendientes', value: items.filter(t => t.status?.status !== 'Completado').length, fill: '#fbc02d' }
  ]
  
  const totalTasks = items.length
  const completedTasks = items.filter(t => t.status?.status === 'Completado').length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const sprintProgressData = [
    { name: 'Sprint', completado: progressPercent, restante: 100 - progressPercent }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '100%' }}>
          <Typography variant="h6">Estado de Tareas</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos</MenuItem>
              {users.map(user => (
                <MenuItem key={user.userId} value={user.userId} sx={{ fontSize: '0.75rem' }}>
                  {user.firtsName}
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

      {/* --- SEGUNDA FILA --- */}
      <Box className="base-card" sx={{ gridColumn: 'span 2' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
          <Typography variant="h6">
            {hoursFilter === 'all' ? 'Comparativa Horas por Desarrollador' : `Horas - ${users.find(u => u.userId === hoursFilter)?.firtsName || ''}`}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={hoursFilter}
              onChange={(e) => setHoursFilter(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos los Devs</MenuItem>
              {users.map(user => (
                <MenuItem key={user.userId} value={user.userId} sx={{ fontSize: '0.75rem' }}>
                  {user.firtsName} {user.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={devComparisonData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={false} /><YAxis />
            <Tooltip 
              labelFormatter={(value) => {
                if (hoursFilter === 'all') return value; // Muestra nombre del dev en modo grupal
                return ''; // Quita el nombre/título del encabezado en modo individual
              }}
              formatter={(value, name) => [value, name]}
            />
            <Legend />
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
            if (priorityName === 'High' || priorityName === 'Alta') { pCol = '#ff002f'; pBg = '#ffd0e0' }
            else if (priorityName === 'Medium' || priorityName === 'Media') { pCol = '#693ff6'; pBg = '#f4edff' }
            else if (priorityName === 'Low' || priorityName === 'Baja') { pCol = '#2698a2'; pBg = '#bdf2fc' }

            let sCol = '#000000', sBg = '#a9a9a9', border = '#858585'
            const statusStr = item.status?.status;
            if (statusStr === 'Completado') { sCol = '#123013'; sBg = '#bbffc1'; border = '#4caf50' }
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
