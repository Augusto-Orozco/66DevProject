import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Fab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions 
} from '@mui/material' // <-- NUEVAS IMPORTACIONES AÑADIDAS
import { DndContext, closestCenter, useDroppable} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable'
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

  // Agrupar tareas por user_stories_id
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.userStoryId || 'none'
    if (!acc[key]) {
      acc[key] = {
        name: task.userStoryName || 'No Story',
        tasks: []
      }
    }
    acc[key].tasks.push(task)
    return acc
  }, {})

  return (
    <Box
      ref={setNodeRef}
      className="base-card"
      sx={{
        width: 320,
        minWidth: 320, // <-- Asegura que todos tengan la misma dimensión y no se encojan
        minHeight: 500,
        backgroundColor: isOver ? '#f5f5f5' : 'white',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: '2px solid #f0f0f0', pb: 1, color: '#333' }}>
        {title}
      </Typography>

      <SortableContext
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(groupedTasks).map(([storyId, storyData]) => (
            <Box key={storyId} sx={{ mb: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#666', 
                  mb: 1, 
                  pl: 1,
                  borderLeft: '4px solid #1976d2',
                  backgroundColor: '#f8f9fa',
                  py: 0.5
                }}
              >
                {storyData.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {storyData.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Box>
            </Box>
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
  
  // --- NUEVO: ESTADO PARA EL MODAL DE CONFIRMACIÓN ---
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Obtener tareas sin sprint
        const unassignedRes = await fetch(`/tasks/unassigned`)
        const unassignedTasks = await unassignedRes.json()

        const newColumns = {
          'backlog': {
            title: 'Backlog',
            tasks: unassignedTasks.map(t => ({
              id: t.taskId.toString(),
              title: t.title,
              description: t.description,
              userStoryId: t.userStory?.userStoriesId || 'Sin ID de historia',
              userStoryName: t.userStory?.name || 'Sin historia de usuario'
            }))
          }
        }

        // 2. Obtener todos los sprints
        const sprintsRes = await fetch(`/sprints`)
        const sprints = await sprintsRes.json()

        // 3. Para cada sprint, obtener sus tareas
        for (const sprint of sprints) {
          const tasksRes = await fetch(`/sprintTasks/${sprint.sprintId}`)
          const sprintTasks = await tasksRes.json()
          
          newColumns[`sprint-${sprint.sprintId}`] = {
            title: `Sprint ${sprint.sprintId}`,
            tasks: sprintTasks.map(st => ({
              id: st.task.taskId.toString(),
              title: st.task.title,
              description: st.task.description,
              userStoryId: st.task.userStory?.userStoriesId || 'Sin ID de historia',
              userStoryName: st.task.userStory?.name || 'Sin historia de usuario'
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

  /* Encuentra en qué columna está una tarea */
  const findContainer = (id) => {
    if (columns[id]) return id
    return Object.keys(columns).find(key =>
      columns[key].tasks.some(item => item.id === id)
    )
  }

  /* --- DRAG LOGIC --- */
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const from = findContainer(active.id)
    const to = findContainer(over.id)

    if (!from || !to || from === to) return

    const taskId = active.id
    const task = columns[from].tasks.find(item => item.id === taskId)

    // Actualización del estado
    setColumns(prev => {
      const sourceTasks = [...prev[from].tasks]
      const destTasks = [...prev[to].tasks]
      const [movedTask] = sourceTasks.splice(sourceTasks.findIndex(t => t.id === taskId), 1)
      destTasks.push(movedTask)

      return {
        ...prev,
        [from]: { ...prev[from], tasks: sourceTasks },
        [to]: { ...prev[to], tasks: destTasks }
      }
    })
    
    try {
      if (to === 'backlog') {
        // Quitar de sprint
        await fetch(`/tasks/${taskId}/unassign`, { method: 'PUT' })
      } else if (to.startsWith('sprint-')) {
        // Asignar a sprint
        const sprintId = to.replace('sprint-', '')
        await fetch(`/tasks/${taskId}/assign/${sprintId}`, { method: 'PUT' })
      }
    } catch (error) {
      console.error('Error updating task assignment:', error)
    }
  }

  // Crear sprint
  const handleCreateSprint = async () => {
    try {
      // Calcular el siguiente número de sprint 
      const sprintCount = Object.keys(columns).filter(key => key.startsWith('sprint-')).length;
      const nextSprintNumber = sprintCount + 1;

      // Formatear fechas para LocalDateTime 
      const formatDateForJava = (date) => date.toISOString().split('.')[0]; 
      
      const now = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const projectId = 1; //Esta harcodeado el id del proyecto

      const res = await fetch(`${API_BASE_URL}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: { projectId: projectId },
          startDate: formatDateForJava(now),
          endDate: formatDateForJava(nextWeek)
        })
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error del servidor: ${errorData}`);
      }

      const data = await res.json();
      setColumns(prev => ({
        ...prev,
        [`sprint-${data.sprintId}`]: {
          title: `Sprint ${nextSprintNumber}`, 
          tasks: []
        }
      }));

    } catch (error) {
      console.error('Error al crear el nuevo sprint:', error);
      alert("No se pudo crear el sprint. Revisa que el Project ID 1 exista en la base de datos.");
    } finally {
      setOpenDialog(false);
    }
  };

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
        flexDirection: 'column',
        position: 'relative' 
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
          alignItems: 'flex-start',
          pb: 10 
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

      {/* Boton para crear sirnt */}
      <Fab 
        color="primary" 
        variant="extended"
        aria-label="add sprint" 
        onClick={() => setOpenDialog(true)}
        sx={{ 
          position: 'fixed', 
          bottom: 40, 
          right: 40, 
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(95, 4, 4, 0.2)',
          backgroundColor: '#cc0707',
       
        }}
      >
        + Crear Sprint
      </Fab>

      {/* --- NUEVO: MODAL DE CONFIRMACIÓN --- */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear nuevo Sprint</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas agregar un nuevo Sprint al tablero? Se agregará automáticamente como una columna vacía al final de la derecha.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
          >
            Cancelar
          </Button>
          <Button backgroundColor="red"
            onClick={handleCreateSprint} 
            variant="contained" 
            color="primary"
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* FOOTER */}
      <Footer />

    </Box>
  )
}

export default Gestion