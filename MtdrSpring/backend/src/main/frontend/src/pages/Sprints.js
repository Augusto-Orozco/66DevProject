//Si estas leyendo esto, quiero avisarte que ni Dios pudo arreglar este codigo, por razones que desconozco, las tarjetas que contienen
//las tareas por sprint, no funcionan, pase 7 horas tratando de arreglar esto y no funciono, al menos se ve bonito

//Matenme

//actualizacion 26/05/2026, el codigo funciona, solo Dios y Gemini saben lo que le paso a este codigo... lo importante? Funciona.

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Fab, 
  Drawer,
  Divider,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material' 
import CloseIcon from '@mui/icons-material/Close'
import { DndContext, closestCenter, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import RefreshIcon from '@mui/icons-material/Refresh'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import AddIcon from '@mui/icons-material/Add'
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd'
import IconButton from '@mui/material/IconButton'
import { TextField, Select as MuiSelect, InputLabel, FormControl } from '@mui/material'
import Footer from '../components/Footer'
import '../Assets/styles.css'


/* --- TARJETA DRAGGABLE --- */
function TaskCard({ task, onEditTask }) {
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

  // Detenemos la propagación para que el drag no interfiera con el click si es necesario,
  // pero dnd-kit suele manejarlo. Sin embargo, listeners tienen el onClick del drag.
  // Usaremos un truco: si se mueve, no es click.
  
  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="devs-task-card"
      onClick={() => onEditTask(task)}
      sx={{ cursor: 'pointer', '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' } }}
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
function Column({ id, title, tasks, visibleColumnCount, onAddTask, onEditTask, isSticky }) {
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
        boxShadow: isSticky 
          ? '8px 0 15px -5px rgba(0,0,0,0.1)' 
          : '0 4px 12px rgba(0,0,0,0.05)',
        alignItems: 'stretch',
        position: isSticky ? 'sticky' : 'relative',
        left: 0, 
        zIndex: isSticky ? 10 : 1,
        mr: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
          {title}
        </Typography>
        {id === 'backlog' && (
          <Button
            className="nav-button icon-btn"
            onClick={onAddTask}
            sx={{ 
              color: '#cc0707 !important', 
              minWidth: '32px !important',
              width: 'auto !important',
              height: '32px !important',
              margin: '0 !important',
              padding: '0 !important',
              '&:hover': {
                backgroundColor: 'rgba(204, 7, 7, 0.04) !important',
                padding: '0 12px !important'
              }
            }}
          >
            <span className="icon">
              <AssignmentAddIcon fontSize="small" />
            </span>
            <span className="label" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              Crear Tarea
            </span>
          </Button>
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
                  <TaskCard key={task.id} task={task} onEditTask={onEditTask} />
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
function Sprints({ selectedProjectId }) {
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedSprintId, setSelectedSprintId] = useState(null)
  const [availableSprints, setAvailableSprints] = useState([])
  const [users, setUsers] = useState([])
  
  // --- ESTADO PARA EL MODAL DE CONFIRMACIÓN ---
  const [openDialog, setOpenDialog] = useState(false)

  // --- ESTADO PARA EL MODAL DE CREACIÓN DE TAREAS ---
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
    userStoryId: '',
    sprintId: '',
    assignedUserId: ''
  })

  const [openMenu, setOpenMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const fetchData = async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true)
      console.log('Fetching data for project:', selectedProjectId);
      
      // 1. Obtener tareas sin sprint
      const unassignedRes = await fetch(`/tasks/unassigned/project/${selectedProjectId}`)
      const unassignedTasks = await unassignedRes.json()

      // 2. Obtener jerarquía completa
      const hierarchyRes = await fetch(`/sprints/project/${selectedProjectId}/hierarchy`)
      let sprintsHierarchy = await hierarchyRes.json()
      
      // Debug para ver qué llega exactamente del SP
      console.log('Raw Hierarchy Response:', sprintsHierarchy);

      // 3. Obtener miembros del equipo
      const usersRes = await fetch(`/team/project/${selectedProjectId}`)
      const teamMembers = await usersRes.json()
      setUsers(Array.isArray(teamMembers) ? teamMembers : [])

      const newColumns = {
        'backlog': {
          title: 'Backlog',
          tasks: Array.isArray(unassignedTasks) ? unassignedTasks.map(t => ({
            id: (t.taskId || '').toString(),
            title: t.title || 'Sin título',
            description: t.description || '',
            userStoryId: t.userStory?.userStoriesId || 'none',
            userStoryName: t.userStory?.name || 'Sin historia',
            priorityId: t.priority?.priorityId || '',
            storyPoints: t.storyPoints || t.STORY_POINTS || '',
            objetiveTime: t.objetiveTime || t.OBJETIVE_TIME || t.objectiveTime || t.OBJECTIVE_TIME || '',
            assignedUserId: t.assignedUserId || t.ASSIGNED_USER_ID || (t.taskUser ? (t.taskUser.userId || t.taskUser.USER_ID) : (t.assignedUser ? (t.assignedUser.userId || t.assignedUser.USER_ID) : ''))
          })) : []
        }
      }

      // Normalización defensiva de la jerarquía
      let sprintsArray = [];
      if (Array.isArray(sprintsHierarchy)) {
        sprintsArray = sprintsHierarchy;
      } else if (sprintsHierarchy && typeof sprintsHierarchy === 'object') {
        sprintsArray = sprintsHierarchy.sprints || sprintsHierarchy.SPRINTS || [];
      }

      // Si por alguna razón llega como String (clob no parseado), intentar parsear
      if (typeof sprintsHierarchy === 'string') {
        try {
          const parsed = JSON.parse(sprintsHierarchy);
          sprintsArray = parsed.sprints || parsed.SPRINTS || (Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to parse sprintsHierarchy string:', e);
        }
      }

      const orderedSprints = [...sprintsArray].sort((a, b) => {
        const numA = a.sprintNum || a.SPRINT_NUM || 0;
        const numB = b.sprintNum || b.SPRINT_NUM || 0;
        return numA - numB;
      });
      
      const mappedAvailableSprints = orderedSprints.map((s) => ({
        id: (s.sprintId || s.SPRINT_ID || '').toString(),
        number: s.sprintNum || s.SPRINT_NUM || 0
      })).filter(s => s.id);

      setAvailableSprints(mappedAvailableSprints);

      orderedSprints.forEach(sprint => {
        const sId = (sprint.sprintId || sprint.SPRINT_ID || '').toString();
        const sNum = sprint.sprintNum || sprint.SPRINT_NUM || '?';
        const sTasks = sprint.tasks || sprint.TASKS || [];
        
        if (sId) {
          newColumns[`sprint-${sId}`] = {
            title: `Sprint ${sNum}`,
            tasks: Array.isArray(sTasks) ? sTasks.map(t => ({
              id: (t.taskId || t.TASK_ID || t.id || t.ID || '').toString(),
              title: t.title || t.TITLE || 'Sin título',
              description: t.description || t.DESCRIPTION || '',
              userStoryId: t.userStory?.userStoriesId || t.userStory?.USER_STORIES_ID || t.userStory?.id || t.userStory?.ID || 'none',
              userStoryName: t.userStory?.name || t.userStory?.NAME || 'Sin historia',
              priorityId: t.priority?.priorityId || t.PRIORITY_ID || t.priority?.id || '',
              storyPoints: t.storyPoints || t.STORY_POINTS || '',
              objetiveTime: t.objetiveTime || t.OBJETIVE_TIME || t.objectiveTime || t.OBJECTIVE_TIME || '',
              assignedUserId: t.assignedUserId || t.ASSIGNED_USER_ID || (t.taskUser ? (t.taskUser.userId || t.taskUser.USER_ID) : (t.assignedUser ? (t.assignedUser.userId || t.assignedUser.USER_ID) : ''))
            })).filter(t => t.id) : []
          };
        }
      });

      setColumns(newColumns);

      // 4. Intentar obtener asignaciones de forma segura (no bloqueante para el resto)
      try {
        const assignmentsRes = await fetch(`/tasks/assignments/project/${selectedProjectId}`)
        if (assignmentsRes.ok) {
          const assignments = await assignmentsRes.json()
          const assignmentMap = Array.isArray(assignments) ? assignments.reduce((acc, curr) => {
            const tId = (curr.task?.taskId || curr.taskId || '').toString()
            if (tId) acc[tId] = curr.user?.userId || curr.userId
            return acc
          }, {}) : {}

          // Actualizar las columnas con las asignaciones encontradas
          setColumns(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(colKey => {
              updated[colKey].tasks = updated[colKey].tasks.map(task => ({
                ...task,
                assignedUserId: assignmentMap[task.id] || task.assignedUserId || ''
              }))
            })
            return updated
          })
        }
      } catch (err) {
        console.warn('No se pudieron cargar las asignaciones, pero el tablero continuará:', err)
      }

      const [prioritiesRes, userStoriesRes, statusesRes] = await Promise.all([
        fetch('/priorities'),
        fetch('/userStories'),
        fetch('/statuses')
      ])
      setPriorities(await prioritiesRes.json())
      setUserStories(await userStoriesRes.json())
      setStatuses(await statusesRes.json())

    } catch (error) {
      console.error('Error in fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedProjectId])

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
      const sprintKeys = columnKeys
        .filter(k => k.startsWith('sprint-'))
        .sort((a, b) => {
          const idA = parseInt(a.split('-')[1]);
          const idB = parseInt(b.split('-')[1]);
          const sprintA = availableSprints.find(s => s.id === idA);
          const sprintB = availableSprints.find(s => s.id === idB);
          return (sprintA?.number || 0) - (sprintB?.number || 0);
        })
      return [backlogKey, ...sprintKeys].filter(k => columns[k]);
    } else {
      const selectedKey = `sprint-${selectedSprintId}`;
      return [backlogKey, selectedKey].filter(k => columns[k]);
    }
  };

  const visibleColumnsToRender = getVisibleColumns();
  const isSprintSelected = selectedSprintId !== null;
  const visibleColumnCount = isSprintSelected ? 2 : 4;

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const from = findContainer(active.id)
    const to = findContainer(over.id)

    if (!from || !to || from === to) return

    const taskId = active.id
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
        await fetch(`/tasks/${taskId}/unassign`, { method: 'PUT' })
      } else if (to.startsWith('sprint-')) {
        const sprintId = to.replace('sprint-', '')
        await fetch(`/tasks/${taskId}/assign/${sprintId}`, { method: 'PUT' })
      }
    } catch (error) {
      console.error('Error updating task assignment:', error)
    }
  }

  const handleCreateSprint = async () => {
    try {
      if (!selectedProjectId) return;
      const formatDateForJava = (date) => date.toISOString().split('.')[0]; 
      const now = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const res = await fetch(`/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: { projectId: selectedProjectId },
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
          title: `Sprint ${data.sprintNum}`, 
          tasks: []
        }
      }));

      setAvailableSprints(prev => [
        ...prev, 
        { id: data.sprintId, number: data.sprintNum }
      ]);

    } catch (error) {
      console.error('Error al crear el nuevo sprint:', error);
      alert("No se pudo crear el sprint. Revisa la conexión con el servidor.");
    } finally {
      setOpenDialog(false);
    }
  };

  const handleOpenAddTask = () => {
    setIsEditing(false)
    setNewTask({
      taskId: null,
      title: '',
      description: '',
      storyPoints: '',
      objetiveTime: '',
      priorityId: '',
      userStoryId: '',
      sprintId: '',
      assignedUserId: ''
    })
    setOpenTaskDialog(true)
  }

  const handleOpenEditTask = (task) => {
    setIsEditing(true)
    setNewTask({
      taskId: task.id,
      title: task.title,
      description: task.description,
      storyPoints: task.storyPoints || '',
      objetiveTime: task.objetiveTime || '',
      priorityId: task.priorityId || '',
      userStoryId: (task.userStoryId === 'none' || task.userStoryId === 'Sin ID') ? '' : task.userStoryId,
      assignedUserId: task.assignedUserId || ''
    })
    setOpenTaskDialog(true)
  }

  const handleSaveTask = async () => {
    try {
      if (!newTask.title || !newTask.priorityId || !newTask.userStoryId) {
        alert('Por favor completa los campos obligatorios: Título, Prioridad e Historia de Usuario');
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        projectId: selectedProjectId,
        userStoryId: newTask.userStoryId,
        priorityId: newTask.priorityId,
        storyPoints: parseInt(newTask.storyPoints) || 0,
        objectiveTime: parseInt(newTask.objetiveTime) || 0,
        sprintId: newTask.sprintId || null,
        assignedUserId: newTask.assignedUserId || null
      };

      // Si estamos editando, usamos el método save normal o extendemos el atómico
      // Por ahora, el backend solo tiene CREATE_TASK_ATOMIC para este DTO.
      const res = await fetch('/tasks/atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (!res.ok) throw new Error('Error al guardar la tarea');
      
      await fetchData(); 
      setOpenTaskDialog(false);
      
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error al guardar la tarea');
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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <Box className={`floating-menu ${openMenu ? 'open' : ''}`}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {openMenu && (
            <Button
              variant="contained"
              onClick={() => { setSelectedSprintId(null); setOpenMenu(false); }}
              sx={{ width: '2.5rem', height: '2.5rem', minWidth: 0, padding: 0, borderRadius: '50%', backgroundColor: '#555', mb: 1 }}
            >
              <RefreshIcon sx={{ fontSize: '1.2rem' }} />
            </Button>
          )}
          <Button
            className="main-btn"
            variant="contained"
            onClick={() => setOpenMenu(prev => !prev)}
            sx={{ width: '2.5rem', height: '2.5rem', minWidth: 0, padding: 0, borderRadius: '50%', zIndex: 1000 }}
          >
            <ViewWeekIcon sx={{ fontSize: '1.2rem' }} />
          </Button>
          {openMenu && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '200px', overflowY: 'auto', mt: 1, padding: '4px' }}>
              {availableSprints.map((sprint) => (
                <IconButton
                  key={sprint.id}
                  onClick={() => { setSelectedSprintId(sprint.id); setOpenMenu(false); }}
                  sx={{ width: '2.2rem', height: '2.2rem', minWidth: 0, padding: 0, borderRadius: '50%', backgroundColor: 'white', border: '1px solid #ccc', color: '#333', fontSize: '0.8rem' }}
                >
                  {sprint.number}
                </IconButton>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', py: 3, pr: 3, pl: 0, ml: 3, overflowX: 'auto', width: 'calc(100% - 24px)', flexGrow: 1, alignItems: 'stretch', justifyContent: 'flex-start', pb: 10 }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {visibleColumnsToRender.map((id) => {
            const columnData = columns[id];
            return (
              <Column
                key={id}
                id={id}
                title={columnData.title}
                tasks={columnData.tasks}
                visibleColumnCount={visibleColumnCount}
                onAddTask={handleOpenAddTask}
                onEditTask={handleOpenEditTask}
                isSticky={id === 'backlog'}
              />
            );
          })}
        </DndContext>
      </Box>

      <Fab color="primary" variant="extended" onClick={() => setOpenDialog(true)} sx={{ position: 'fixed', bottom: 40, right: 40, fontWeight: 'bold', backgroundColor: '#cc0707' }}>
        + Crear Sprint
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear nuevo Sprint</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas agregar un nuevo Sprint al tablero?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleCreateSprint} variant="contained" color="primary">Aceptar</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: '50vw' }, display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 15px rgba(93, 93, 93, 0.24)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottom: '2px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</Typography>
          <IconButton onClick={() => setOpenTaskDialog(false)} size="small"><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Nombre de la tarea" fullWidth value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <TextField label="Descripción" fullWidth multiline rows={4} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Story Points" type="number" fullWidth value={newTask.storyPoints} onChange={(e) => setNewTask({ ...newTask, storyPoints: e.target.value })} />
              <TextField label="Tiempo Estimado (horas)" type="number" fullWidth value={newTask.objetiveTime} onChange={(e) => setNewTask({ ...newTask, objetiveTime: e.target.value })} />
            </Box>


            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <MuiSelect label="Prioridad" value={newTask.priorityId} onChange={(e) => setNewTask({ ...newTask, priorityId: e.target.value })}>
                {priorities.map(p => <MenuItem key={p.priorityId} value={p.priorityId}>{p.priorityName}</MenuItem>)}
              </MuiSelect>
            </FormControl>


            <FormControl fullWidth>
              <InputLabel>Historia de Usuario</InputLabel>
              <MuiSelect label="Historia de Usuario" value={newTask.userStoryId} onChange={(e) => setNewTask({ ...newTask, userStoryId: e.target.value })}>
                {userStories.map(us => <MenuItem key={us.userStoriesId} value={us.userStoriesId}>{us.name}</MenuItem>)}
              </MuiSelect>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Asignar a Desarrollador</InputLabel>
              <MuiSelect
                label="Asignar a Desarrollador"
                value={newTask.assignedUserId}
                onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}
              >
                <MenuItem value=""><em>Sin asignar</em></MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.userId} value={u.userId}>
                    {u.firtsName} {u.lastName}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>


          </Box>
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 2, backgroundColor: 'white' }}>
          <Button onClick={() => setOpenTaskDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained" sx={{ backgroundColor: '#cc0707', '&:hover': { backgroundColor: '#a30606' }, fontWeight: 'bold' }}>{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
        </Box>
      </Drawer>

      <Footer />
    </Box>
  )
}

export default Sprints