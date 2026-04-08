import { useState } from 'react'
import {Box} from '@mui/material'

function Dashboard() {
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
    justifyContent: 'center',
    alignItems: 'center'
  }
  return (
    <Box
      sx={{
        height: '80vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 4,
        mt: 5,
        mx: 4
      }}
    >
      {/* Cards */}
      <Box sx={card}>1</Box>
      <Box sx={card}>2</Box>
      <Box sx={card}>3</Box>
      <Box sx={card}>4</Box>
    
      <Box sx={{ ...card, gridColumn: 'span 2' }}>Gráfica</Box>
      <Box sx={card}>Alertas</Box>
    
      <Box sx={{ ...card, gridColumn: 'span 4' }}>Tabla</Box>
    </Box>
  )
}


export default Dashboard