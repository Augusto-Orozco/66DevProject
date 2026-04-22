import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import {
  DndContext,
  closestCenter,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Footer from '../components/Footer'
import '../Assets/styles.css'

/* --- TARJETA DRAGGABLE --- */
function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="devs-task-card"
    >
      <Typography fontSize="0.85rem" fontWeight="bold">
        {task.title}
      </Typography>
      <Typography fontSize="0.75rem">
        {task.description}
      </Typography>
    </Box>
  )
}

/* --- COLUMNA DROPPABLE --- */
function Column({ id, title, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  })

  return (
    <Box
      ref={setNodeRef}
      className="base-card"
      sx={{
        width: 300,
        minHeight: 400,
        backgroundColor: isOver ? '#f5f5f5' : 'white',
        transition: 'background-color 0.2s ease'
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </Box>
  )
}

/* --- MAIN --- */
function Gestion() {

  /* 🔹 Datos dummy */
  const [columns, setColumns] = useState({
    backlog: [
      { id: '1', title: 'Login UI', description: 'Crear pantalla login' },
      { id: '2', title: 'Navbar', description: 'Animaciones navbar' }
    ],
    sprint1: [],
    sprint2: []
  })

  /* 🔍 Encuentra en qué columna está una tarea */
  const findContainer = (id) => {
    return Object.keys(columns).find(key =>
      columns[key].some(item => item.id === id)
    )
  }

  /* --- DRAG LOGIC --- */
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const from = findContainer(active.id)

    const to =
      Object.keys(columns).includes(over.id)
        ? over.id
        : findContainer(over.id)

    if (!from || !to) return
    if (from === to) return

    const task = columns[from].find(item => item.id === active.id)

    setColumns(prev => ({
      ...prev,
      [from]: prev[from].filter(item => item.id !== active.id),
      [to]: [...prev[to], task]
    }))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      
      {/* CONTENIDO PRINCIPAL */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          padding: 3,
          overflowX: 'auto',
          flexGrow: 1
        }}
      >
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(columns).map(([id, tasks]) => (
            <Column
              key={id}
              id={id}
              title={id.toUpperCase()}
              tasks={tasks}
            />
          ))}
        </DndContext>
      </Box>

      {/* FOOTER */}
      <Footer />

    </Box>
  )
}

export default Gestion