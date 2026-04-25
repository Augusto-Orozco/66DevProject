import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
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

const API_BASE_URL = 'http://localhost:8080'

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
      <Typography fontSize="0.75rem" sx={{ mt: 0.5, color: 'text.secondary' }}>
        {task.userStoryName}
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
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', pb: 1 }}>
        {title}
      </Typography>

      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 2 }}>
              No tasks
            </Typography>
          )}
        </Box>
      </SortableContext>
    </Box>
  )
}

/* --- MAIN --- */
function Gestion() {
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 1. Obtener todos los sprints
        const sprintsRes = await fetch(`${API_BASE_URL}/sprints`)
        const sprints = await sprintsRes.json()

        const newColumns = {}

        // 2. Para cada sprint, obtener sus tareas
        for (const sprint of sprints) {
          const tasksRes = await fetch(`${API_BASE_URL}/sprintTasks/${sprint.sprintId}`)
          const sprintTasks = await tasksRes.json()
          
          // Mapear el modelo SprintTask al formato que espera el frontend
          newColumns[`sprint-${sprint.sprintId}`] = {
            title: `Sprint ${sprint.sprintId}`,
            tasks: sprintTasks.map(st => ({
              id: st.task.taskId.toString(),
              title: st.task.title,
              description: st.task.description,
              userStoryName: st.task.userStory?.name || 'No Story'
            }))
          }
        }

        setColumns(newColumns)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  /* 🔍 Encuentra en qué columna está una tarea */
  const findContainer = (id) => {
    return Object.keys(columns).find(key =>
      columns[key].tasks.some(item => item.id === id)
    )
  }

  /* --- DRAG LOGIC --- */
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const from = findContainer(active.id)
    const to = Object.keys(columns).includes(over.id) ? over.id : findContainer(over.id)

    if (!from || !to || from === to) return

    const task = columns[from].tasks.find(item => item.id === active.id)

    setColumns(prev => ({
      ...prev,
      [from]: { ...prev[from], tasks: prev[from].tasks.filter(item => item.id !== active.id) },
      [to]: { ...prev[to], tasks: [...prev[to].tasks, task] }
    }))
    
    // Aquí se debería llamar a un endpoint para actualizar el sprint_id de la tarea en la DB
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
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
          flexGrow: 1,
          alignItems: 'flex-start'
        }}
      >
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(columns).map(([id, columnData]) => (
            <Column
              key={id}
              id={id}
              title={columnData.title}
              tasks={columnData.tasks}
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