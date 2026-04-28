import { useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import Footer from '../components/Footer'
import '../Assets/styles.css'

function AddDevs() {

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [members, setMembers] = useState([])

  const handleAdd = () => {
    if (!name.trim() || !lastName.trim()) return

    const newMember = {
      id: Date.now(),
      name,
      lastName
    }

    setMembers(prev => [...prev, newMember])
    setName('')
    setLastName('')
  }

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
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          pt: '140px',
          pb: 5,
          //mt: '120px'
        }}
      >
        <Box className="base-card" sx={{ width: 500 }}>

          <Typography variant="h5" sx={{ mb: 3 }}>
            Agregar miembro al equipo
          </Typography>

          {/* FORM */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleAdd}
              sx={{
                backgroundColor: 'var(--oracle-red)',
                '&:hover': {
                  backgroundColor: 'var(--oracle-red-hover)'
                }
              }}
            >
              Agregar
            </Button>
          </Box>

          {/* LISTA */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Equipo
            </Typography>

            {members.length === 0 && (
              <Typography fontSize="0.85rem" color="text.secondary">
                No hay miembros aún
              </Typography>
            )}

            {members.map(member => (
          
              <Box
              key={member.id}
              className="devs-task-card"
              sx={{
                mb: 1,
                p: 4,
                minHeight: 60,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              
              <Typography variant="h6" fontWeight={600}>
                {member.name} {member.lastName}
              </Typography>



              
            </Box>

              
              
            ))}
          </Box>
        </Box>
      </Box>

      {/* FOOTER */}
      <Footer />

    </Box>
  )
}

export default AddDevs