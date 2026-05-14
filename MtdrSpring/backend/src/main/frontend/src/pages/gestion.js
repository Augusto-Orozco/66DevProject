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
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material' // <-- NUEVAS IMPORTACIONES AÑADIDAS
import { DndContext, closestCenter, useDroppable} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import RefreshIcon from '@mui/icons-material/Refresh'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import { TextField, Select as MuiSelect, InputLabel, FormControl } from '@mui/material'
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
function Column({ id, title, tasks, visibleColumnCount, onAddTask }) {
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
        flex: `0 0 calc((100% - ${(visibleColumnCount - 1) * 16}px) / ${visibleColumnCount})`,
        minWidth: 280,
        maxWidth: 'none',
        backgroundColor: isOver ? '#f5f5f5' : 'white',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        alignItems: 'stretch'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
          {title}
        </Typography>
        {id === 'backlog' && (
          <IconButton size="small" onClick={onAddTask} sx={{ color: '#cc0707' }}>
            <AddIcon />
          </IconButton>
        )}
      </Box>

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
                  color: '#000000', 
                  mb: 1, 
                  pl: 1,
                  borderLeft: '4px solid #1976d2',
                  background: 'linear-gradient(90deg, rgba(132, 164, 196, 0.12) 0%, rgba(135, 171, 198, 0.01) 100%)',
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
  const [selectedSprintId, setSelectedSprintId] = useState(null)
  const [availableSprints, setAvailableSprints] = useState([])
  
  // --- NUEVO: ESTADO PARA EL MODAL DE CONFIRMACIÓN ---
  const [openDialog, setOpenDialog] = useState(false)

  // --- NUEVO: ESTADO PARA EL MODAL DE CREACIÓN DE TAREAS ---
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [priorities, setPriorities] = useState([])
  const [userStories, setUserStories] = useState([])
  const [statuses, setStatuses] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    storyPoints: '',
    objetiveTime: '',
    priorityId: '',
    userStoryId: ''
  })

  const [openMenu, setOpenMenu] = useState(false)

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
        const orderedSprints = [...sprints].sort((a, b) => a.sprintNum - b.sprintNum)
        
        setAvailableSprints(orderedSprints.map((s) => ({
          id: s.sprintId,
          number: s.sprintNum
        })))

        // 3. Para cada sprint, obtener sus tareas
        for (const sprint of orderedSprints) {
          const tasksRes = await fetch(`/sprintTasks/${sprint.sprintId}`)
          const sprintTasks = await tasksRes.json()
          
          newColumns[`sprint-${sprint.sprintId}`] = {
            title: `Sprint ${sprint.sprintNum}`,
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

        // 4. Obtener prioridades, historias de usuario y estatus
        const [prioritiesRes, userStoriesRes, statusesRes] = await Promise.all([
          fetch('/priorities'),
          fetch('/userStories'),
          fetch('/statuses')
        ])
        setPriorities(await prioritiesRes.json())
        setUserStories(await userStoriesRes.json())
        setStatuses(await statusesRes.json())

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

  const getVisibleColumns = () => {
    const columnKeys = Object.keys(columns);
    const backlogKey = 'backlog';
    
    if (selectedSprintId === null) {
      // Mostrar backlog + sprints ordenados por su número (que está en el título)
      const sprintKeys = columnKeys
        .filter(k => k.startsWith('sprint-'))
        .sort((a, b) => {
          // Intentamos obtener el número del sprint desde availableSprints para un sorteo más fiable
          const idA = parseInt(a.split('-')[1]);
          const idB = parseInt(b.split('-')[1]);
          const sprintA = availableSprints.find(s => s.id === idA);
          const sprintB = availableSprints.find(s => s.id === idB);
          return (sprintA?.number || 0) - (sprintB?.number || 0);
        })
        
      
      return [backlogKey, ...sprintKeys].filter(k => columns[k]);
    } else {
      // Mostrar backlog + sprint específico
      const selectedKey = `sprint-${selectedSprintId}`;
      return [backlogKey, selectedKey].filter(k => columns[k]);
    }
  };

  const visibleColumnsToRender = getVisibleColumns();
  const visibleColumnCount = visibleColumnsToRender.length;

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
      // Formatear fechas para LocalDateTime 
      const formatDateForJava = (date) => date.toISOString().split('.')[0]; 
      
      const now = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const projectId = 1; //Esta harcodeado el id del proyecto

      const res = await fetch(`/sprints`, {
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
      
      // Actualizar columnas
      setColumns(prev => ({
        ...prev,
        [`sprint-${data.sprintId}`]: {
          title: `Sprint ${data.sprintNum}`, 
          tasks: []
        }
      }));

      // Actualizar lista de sprints disponibles para el menú
      setAvailableSprints(prev => [
        ...prev, 
        { id: data.sprintId, number: data.sprintNum }
      ]);

    } catch (error) {
      console.error('Error al crear el nuevo sprint:', error);
      alert("No se pudo crear el sprint. Revisa que el Project ID 1 exista en la base de datos.");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const pendingStatus = statuses.find(s => s.status === 'Pendiente' || s.status === 'pending') || statuses[0];
      
      const taskToSave = {
        title: newTask.title,
        description: newTask.description,
        storyPoints: parseInt(newTask.storyPoints),
        objetiveTime: parseInt(newTask.objetiveTime),
        priority: { priorityId: newTask.priorityId },
        userStory: { userStoriesId: newTask.userStoryId },
        status: { statusId: pendingStatus.statusId },
        deleted: 'N'
      };

      const res = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskToSave)
      });

      if (!res.ok) throw new Error('Error al crear la tarea');

      const data = await res.json();

      setColumns(prev => ({
        ...prev,
        backlog: {
          ...prev.backlog,
          tasks: [...prev.backlog.tasks, {
            id: data.taskId.toString(),
            title: data.title,
            description: data.description,
            userStoryId: data.userStory?.userStoriesId,
            userStoryName: data.userStory?.name
          }]
        }
      }));

      setOpenTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        storyPoints: '',
        objetiveTime: '',
        priorityId: '',
        userStoryId: ''
      });

    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea');
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

    <Box className={`floating-menu ${openMenu ? 'open' : ''}`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        
        {/* Reset Button (Above) */}
        {openMenu && (
          <Button
            variant="contained"
            onClick={() => {
              setSelectedSprintId(null)
              setOpenMenu(false)
            }}
            sx={{
              width: '2.5rem',
              height: '2.5rem',
              minWidth: 0,
              padding: 0,
              borderRadius: '50%',
              backgroundColor: '#555',
              '&:hover': { backgroundColor: '#333' },
              mb: 1
            }}
          >
            <RefreshIcon sx={{ fontSize: '1.2rem' }} />
          </Button>
        )}

        {/* Botón principal */}
        <Button
          className="main-btn"
          variant="contained"
          onClick={() => setOpenMenu(prev => !prev)}
          sx={{
            width: '2.5rem',
            height: '2.5rem',
            minWidth: 0,
            padding: 0,
            borderRadius: '50%',
            zIndex: 1000
          }}
        >
          <ViewWeekIcon sx={{ fontSize: '1.2rem' }} />
        </Button>

        {/* Lista scrolleable (Below) */}
        {openMenu && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxHeight: '200px',
              overflowY: 'auto',
              mt: 1,
              padding: '4px',
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' }
            }}
          >
            {availableSprints.map((sprint) => (
              <IconButton
                key={sprint.id}
                variant="outlined"
                onClick={() => {
                  setSelectedSprintId(sprint.id)
                  setOpenMenu(false)
                }}
                sx={{
                  width: '2.2rem',
                  height: '2.2rem',
                  minWidth: 0,
                  padding: 0,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  color: '#333',
                  fontSize: '0.8rem'
                }}
              >
                {sprint.number}
              </IconButton>
            ))}
          </Box>
        )}
        
      </Box>
    </Box>
      

      {/* CONTENIDO PRINCIPAL */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          padding: 3,
          overflowX: 'auto',
          width: '100%',
          flexGrow: 1,
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          pb: 10 
        }}
      >
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {visibleColumnsToRender.map((id) => {
            const columnData = columns[id];
            return (
              <Column
                key={id}
                id={id}
                title={columnData.title}
                tasks={columnData.tasks}
                visibleColumnCount={visibleColumnCount}
                onAddTask={() => setOpenTaskDialog(true)}
              />
            );
          })}
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

      {/* --- NUEVO: MODAL DE CREACIÓN DE TAREA --- */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nueva Tarea</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de la tarea"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Story Points"
                type="number"
                fullWidth
                value={newTask.storyPoints}
                onChange={(e) => setNewTask({ ...newTask, storyPoints: e.target.value })}
              />
              <TextField
                label="Tiempo Estimado (horas)"
                type="number"
                fullWidth
                value={newTask.objetiveTime}
                onChange={(e) => setNewTask({ ...newTask, objetiveTime: e.target.value })}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <MuiSelect
                label="Prioridad"
                value={newTask.priorityId}
                onChange={(e) => setNewTask({ ...newTask, priorityId: e.target.value })}
              >
                {priorities.map((p) => (
                  <MenuItem key={p.priorityId} value={p.priorityId}>
                    {p.priorityName}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Historia de Usuario</InputLabel>
              <MuiSelect
                label="Historia de Usuario"
                value={newTask.userStoryId}
                onChange={(e) => setNewTask({ ...newTask, userStoryId: e.target.value })}
              >
                {userStories.map((us) => (
                  <MenuItem key={us.userStoriesId} value={us.userStoriesId}>
                    {us.name}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenTaskDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained" 
            sx={{ backgroundColor: '#cc0707', '&:hover': { backgroundColor: '#a30606' } }}
            disabled={!newTask.title || !newTask.priorityId || !newTask.userStoryId}
          >
            Crear Tarea
          </Button>
        </DialogActions>
      </Dialog>

      {/* FOOTER */}
      <Footer />

    </Box>
  )
}

export default Gestion