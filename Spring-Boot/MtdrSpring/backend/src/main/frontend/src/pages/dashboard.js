import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  CircularProgress
} from '@mui/material'

function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
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
  }, [])

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
        gridTemplateRows: 'auto',
        gap: 4,
        my: 5,
        mx: 4
      }}
    >
      {/* --- FILA 1: MÉTRICAS --- */}
      <Box sx={card}>
        <strong>Total Tareas</strong>
        {loading ? <CircularProgress size={20} sx={{ mt: 1 }} /> : <h2>{items.length}</h2>}
      </Box>
      <Box sx={card}>2</Box>
      <Box sx={card}>3</Box>
      <Box sx={card}>4</Box>

      {/* --- FILA 2: GRÁFICA Y ALERTAS --- */}
      <Box sx={{ ...card, gridColumn: 'span 2' }}>Gráfica</Box>
      <Box sx={card}>Alertas</Box>
      <Box sx={card}>Filtros</Box>
    
      {/* --- FILA 3: LISTADO DE TAREAS (DISEÑO ADAPTADO) --- */}
      <Box 
        sx={{ 
          ...card, 
          gridColumn: 'span 4', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          justifyContent: 'flex-start',
          p: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Listado de Actividades Recientes
        </Typography>

        {/* --- ENCABEZADO ESTÁTICO REFORZADO --- */}
        {!loading && items.length > 0 && (
          <Box sx={{ display: 'flex', width: '100%', px: 2, mb: 1, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold', ml: '6px' }}>TAREA</Typography>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold', ml: '6px' }}>ESTATUS</Typography>
            <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold', ml: '6px' }}>PRIORIDAD</Typography>
          </Box>
        )}

        {loading && <CircularProgress sx={{ alignSelf: 'center', my: 4 }} />}

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!loading && items.map((item) => {
            let color = '#fbc02d' //
            if (item.status === 'COMPLETADO') color = '#4caf50' // 🟢 Completado
            if (item.priority === 'HIGH' || item.priority === 'ALTA') color = '#f44336' // 🔴 Alta

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
                  transition: '0.2s',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 5, backgroundColor: color + '22', color: color, fontWeight: 'bold' }}>
                    {item.status}
                  </Typography> 
                </Box>

                <Box sx={{ flex: 1, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="caption" color="text.disabled">
                    {item.priority}
                  </Typography>
                </Box>
              </Box>
            )
          })}

          {!loading && items.length === 0 && !error && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', width: '100%' }}>
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
