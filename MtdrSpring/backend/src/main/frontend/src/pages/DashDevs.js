import { useState, useEffect } from 'react'
import {Box, CircularProgress, Typography, Button} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

function DashDevs() {
    const [active, setActive] = useState(null)
    
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleClick = (id) => {
      setActive(id === active ? null : id)
    }
    const card = {
    backgroundColor: 'white',
    transition: '0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
      borderRadius: 3,
      boxShadow: 4,
    },
    borderRadius: 2,
    boxShadow: 2,
    p: 4,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }

  const fetchTasks = () => {
    setLoading(true)
    const API_LIST = '/api/DevTask'; 
    fetch(API_LIST)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar tareas')
        return res.json()
      })
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Separar tareas por status si es necesario
  
  return (
    <Box
      sx={{
        height: '80vh',
        display: 'grid',
        gridTemplateColumns: '350px 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
        mt: 5,
        mx: 4
      }}
    >
      <Box
        sx={{
          ...card,
          gridRow: 'span 2',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}
      >

        {/* HEADER FIJO */}
        <Box 
          sx={{ 
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1,
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1,
            pb: 1
          }}
        >
          <Typography variant="h6">
            Tareas
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
        
        {loading && <CircularProgress />}
        
        {error && (
          <Typography color="error">
            Error al cargar tareas
          </Typography>
        )}

        {/* LISTA SCROLLABLE */}
        <Box sx={{ width: '100%', overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
      
          {!loading && items.map(item => {
          
            let color = '#fbc02d'
            if (item.status === 'COMPLETADO') color = '#4caf50'
            if (item.status === 'CON RETRASO') color = '#ff2020'
          
            return (
              <Box
                key={item.taskId}
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.3,
                  p: 1,
                  mb: 1,
                  borderRadius: 1.5,
                  backgroundColor: '#f9f9f9',
                  borderLeft: `6px solid ${color}`
                }}
              >
                <Typography variant="subtitle2" fontSize="0.85rem" fontWeight="bold">
                  {item.title}
                </Typography>

                <Typography variant="body2" fontSize="0.75rem" color="text.secondary">
                  {item.description}
                </Typography>

                <Typography variant="caption" fontSize="0.7rem" sx={{ fontStyle: 'italic' }}>
                  {item.status} | {item.priority}
                </Typography>
              </Box>
            )
          })}

        </Box>
      </Box>
      <Box sx={card}>Grafica</Box>
      <Box sx={card}>Grafica</Box>

      <Box sx={{ ...card, gridColumn: 'span 2'}}> 
        Grafica
      </Box>

    </Box>
    
  ) 
}

export default DashDevs