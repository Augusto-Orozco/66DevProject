import { useState } from 'react'
import {Box} from '@mui/material'

function DashDevs() {
    const [active, setActive] = useState(null)
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
    justifyContent: 'center',
    alignItems: 'center'
  }
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

      <Box sx={{ ...card, gridRow: 'span 2'}}>
        Tareas
      </Box>

      <Box sx={card}>Cuadro 1</Box>
      <Box sx={card}>Cuadro 2</Box>

      <Box sx={{ ...card, gridColumn: 'span 2'}}> 
        Angelsin
      </Box>

    </Box>
  )
}


export default DashDevs