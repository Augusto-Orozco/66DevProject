import React from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import Footer from '../components/Footer'
import '../Assets/styles.css'


function TaskCreator() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* CONTENIDO */}
      <Box
        className="task-creator-wrapper"
        sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box className="base-card" sx={{ width: '100%', maxWidth: 600, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Crear Nueva Tarea
          </Typography>

          <TextField label="Título" fullWidth margin="normal" />
          <TextField label="Descripción" fullWidth margin="normal" multiline rows={4} />

          <TextField
            label="Prioridad"
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </TextField>

          <TextField
            label="Nombre de Usuario"
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="Juan">Juan</option>
            <option value="María">María</option>
            <option value="Pedro">Pedro</option>
          </TextField>

          <TextField
            label="Historias de usuario"
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="Historia 1">Historia 1</option>
            <option value="Historia 2">Historia 2</option>
            <option value="Historia 3">Historia 3</option>
          </TextField>


          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Crear Tarea
          </Button>
        </Box>
      </Box>

      {/* FOOTER */}
      <Footer />
    </Box>
  )
}

export default TaskCreator