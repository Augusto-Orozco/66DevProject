import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button } from '@mui/material'
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import RefreshIcon from '@mui/icons-material/Refresh'

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
    const status = item.status || 'SIN ESTATUS'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.keys(statusCount).map(key => {
    let color = '#9e9e9e'

    if (key === 'COMPLETADO') color = '#4caf50'
    else if (key === 'EN PROGRESO') color = '#fbc02d'
    else if (key === 'Finish') color = '#f44336'

    return {
      name: key,
      value: statusCount[key],
      fill: color
    }
  })

  const card = {
    backgroundColor: 'white',
    transition: '0.3s',
    '&:hover': {
      transform: 'scale(1.01)',
      borderRadius: 3,
      boxShadow: 4,
    },
    borderRadius: 2,
    boxShadow: 2,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '150px'
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
        my: 5,
        mx: 4
      }}
    >
      {/* --- Metrica total tareas --- */}
      <Box sx={card}>
        <strong>Total Tareas</strong>
        {loading ? <CircularProgress size={20} sx={{ mt: 1 }} /> : <h2>{items.length}</h2>}
      </Box>

      {/* --- Grafica de Pastel --- */}
      <Box sx={card}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Estado de Tareas
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                innerRadius={40}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box sx={card}>3</Box>
      <Box sx={card}>4</Box>

      {/* --- SEGUNDA FILA --- */}
      <Box sx={{ ...card, gridColumn: 'span 2' }}>Gráfica</Box>
      <Box sx={card}>Alertas</Box>
      <Box sx={card}>Filtros</Box>

      {/* --- LISTA --- */}
      <Box
        sx={{
          ...card,
          gridColumn: 'span 4',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          p: 3
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Listado de Tareas
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchTasks}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        {/* Header fijo */}
        {!loading && items.length > 0 && (
          <Box sx={{ display: 'flex', width: '100%', px: 2, mb: 1, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold', ml: '6px' }}>TAREA</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center', mr: '13.5px' }}>ESTATUS</Typography>
            <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'right', mr: '18px' }}>PRIORIDAD</Typography>
          </Box>
        )}

        {loading && <CircularProgress sx={{ alignSelf: 'center', my: 4 }} />}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!loading && items.map((item) => {

            // PRIORIDAD COLOR
            let priorityColor = '#292929'
            let priorityBg = '#f5f5f5'

            if (item.priority === 'High' || item.priority === 'ALTA') {
              priorityColor = '#c62828'
              priorityBg = '#ffebee'
            }

            // STATUS COLOR
            let statusColor = '#000000'
            let statusBg = '#a9a9a9'

            if (item.status === 'COMPLETADO') {
              statusColor = '#123013'
              statusBg = '#bbffc1'
            } else if (item.status === 'EN PROGRESO') {
              statusColor = '#483009'
              statusBg = '#fff9b9'
            } else if (item.status === 'Finish') {
              statusColor = '#541111'
              statusBg = '#fdb4bf'
            }

            // BORDE COLOR
            let color = '#858585'
            if (item.status === 'COMPLETADO') color = '#4caf50'
            if (item.status === 'EN PROGRESO') color = '#fbc02d'
            if (item.status === 'Finish') color = '#ff2020' // Pendiente de cambio por que deberia ser "Con Retraso"

            return (
              <Box
                key={item.taskId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#fcfcfc',
                  borderLeft: `6px solid ${color}`,
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 5,
                      backgroundColor: statusBg,
                      color: statusColor,
                      fontWeight: 'bold'
                    }}
                  >
                    {item.status}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      borderRadius: '999px',
                      backgroundColor: priorityBg,
                      color: priorityColor,
                      fontWeight: 'bold'
                    }}
                  >
                    {item.priority}
                  </Typography>
                </Box>
              </Box>
            )
          })}

          {!loading && items.length === 0 && !error && (
            <Typography sx={{ py: 4, textAlign: 'center', width: '100%' }}>
              No hay tareas en la base de datos.
            </Typography>
          )}

          {error && <Typography color="error">Error: {error}</Typography>}
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard