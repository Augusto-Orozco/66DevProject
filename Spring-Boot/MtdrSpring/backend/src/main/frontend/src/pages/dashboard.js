import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material'

function Dashboard() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8080/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor')
        return res.json()
      })
      .then(data => {
        console.log('Datos recibidos:', data)
        setItems(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setError(error.message)
      })
  }, [])

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
        gridTemplateRows: 'auto', // Permite que la altura de las filas sea dinámica
        gap: 4,
        my: 5, // Margen arriba y abajo para que no se pegue a los bordes de la pantalla
        mx: 4
      }}
    >
      {/* Card de Total Tareas */}
      <Box sx={card}>
        <strong>Total Tareas</strong>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <h2>{items.length}</h2>
        )}
      </Box>
    
      {/* Se eliminó overflow: 'auto' */}
      <Box sx={{ ...card, gridColumn: 'span 4', display: 'block' }}>
        <Typography variant="h6" gutterBottom component="div" sx={{ width: '100%', textAlign: 'left', fontWeight: 'bold' }}>
          Listado de Tareas (Base de Datos)
        </Typography>
        {/* Se eliminó maxHeight */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          {/* Se eliminó stickyHeader */}
          <Table aria-label="tasks table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Prioridad</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.taskId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {error ? 'Error al cargar datos' : 'No hay tareas disponibles'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default Dashboard