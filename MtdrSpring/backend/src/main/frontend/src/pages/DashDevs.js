import { useState, useEffect } from 'react'
import {Box, CircularProgress, Typography, Button, IconButton} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CachedIcon from '@mui/icons-material/Cached';
import Footer from '../components/Footer'
import '../Assets/styles.css'

function DashDevs({ user }) {
    const [active, setActive] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchTasks = () => {
      if (!user?.userId) return
      setLoading(true)
      fetch(`/tasks/user/${user.userId}`)
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

    return (
    <>
    <Box className="devs-grid">
      <Box className="base-card" sx={{ gridRow: 'span 2', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>

        {/* HEADER */}
        <Box sx={{ width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, pb: 1 }}>
          <Typography variant="h6">Tareas</Typography>
          <IconButton size="small" onClick={fetchTasks} disabled={loading}><CachedIcon /></IconButton>
        </Box>

        {loading && <CircularProgress />}
        {error && <Typography color="error">Error al cargar tareas</Typography>}

        {/* LISTA TAREAS */}
        <Box sx={{ width: '100%', overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
          {!loading && items.map(item => {
            let color = '#898989'
            const statusStr = item.status?.status;
            const priorityName = item.priority?.priorityName;
            if (statusStr === 'Completado') color = '#4caf50'
            if (statusStr === 'En Progreso') color = '#fbc02d'
            if (statusStr === 'Atrasado') color = '#e53935'
            return (
              <Box key={item.taskId} className="devs-task-card" style={{ borderLeft: `6px solid ${color}` }}>
                <Typography variant="subtitle2" fontSize="0.85rem" fontWeight="bold">{item.title}</Typography>
                <Typography variant="body2" fontSize="0.75rem" color="text.secondary">{item.description}</Typography>
                <Typography variant="caption" fontSize="0.7rem" sx={{ fontStyle: 'italic' }}>{statusStr || 'SIN ESTATUS'} | {priorityName || 'N/A'}</Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      <Box className="base-card">Grafica</Box>
      <Box className="base-card">Grafica</Box>
      <Box className="base-card" sx={{ gridColumn: 'span 2'}}>Grafica</Box>
    </Box>
    <Footer />
    </>
  ) 
}

export default DashDevs
