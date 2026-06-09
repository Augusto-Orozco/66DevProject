import { useState, useEffect, useCallback } from 'react'
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Drawer,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  MenuItem
} from '@mui/material' 
import CloseIcon from '@mui/icons-material/Close'
import { 
  DndContext, 
  pointerWithin,
  useDroppable, 
  useSensor, 
  useSensors, 
  MouseSensor,
  TouchSensor,
  DragOverlay
} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import RefreshIcon from '@mui/icons-material/Refresh'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import AddIcon from '@mui/icons-material/Add'
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete';
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
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'grab'
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="devs-task-card"
      onClick={(e) => {
        if (!isDragging) onEditTask(task);
      }}
      sx={{ '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' } }}
    >
      <TaskCardContent task={task} />
    </Box>
  )
}

/* --- CONTENIDO DE LA TARJETA --- */
function TaskCardContent({ task }) {
  let sCol = '#000000', sBg = '#a9a9a9'
  const statusStr = task.statusName || 'SIN ESTATUS'
  if (statusStr === 'Completado') { sCol = '#123013'; sBg = '#94e59b' }
  else if (statusStr === 'En Progreso') { sCol = '#483009'; sBg = '#fff9b9' }
  else if (statusStr === 'Atrasado') { sCol = '#541111'; sBg = '#fdb4bf' }

  return (
    <>
      <Typography fontSize="0.85rem" fontWeight="bold">
        {task.title}
      </Typography>
      <Typography fontSize="0.75rem">
        {task.description}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <span className="badge-base" style={{ backgroundColor: sBg, color: sCol }}>{statusStr}</span>
      </Box>
    </>
  )
}

/* --- COLUMNA DROPPABLE --- */
function Column({ id, title, tasks, visibleColumnCount, onAddTask, onEditTask, isSticky }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Debug logging removed (was logging when column is hovered during drag).

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
      className="base-card"
      sx={{
        flex: visibleColumnCount === 2 ? '0 0 calc(50% - 10px)' : '0 0 calc((100% - 60px) / 4)',
        width: visibleColumnCount === 2 ? 'calc(50% - 10px)' : 'calc((100% - 60px) / 4)',
        minWidth: 200, 
        backgroundColor: isOver ? '#f9f9f9' : 'white',
        transition: 'all 0.3s ease',
        display: 'flex', 
        flexDirection: 'column',
        p: 1.5,
        borderRadius: '12px',
        boxShadow: isSticky 
          ? '8px 0 15px -5px rgba(0,0,0,0.1)' 
          : '0 4px 12px rgba(0,0,0,0.05)',
        alignItems: 'stretch',
        position: isSticky ? 'sticky' : 'relative',
        left: 0, 
        zIndex: isSticky ? 10 : 1,
        transform: 'scaleY(-1)',
        '&:hover': {
          transform: 'scaleY(-1) scale(1.01)',
          boxShadow: '0px 8px 16px rgba(0,0,0,0.2) !important'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{title}</Typography>
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
              '&:hover': { backgroundColor: 'rgba(204, 7, 7, 0.04) !important', padding: '0 12px !important' }
            }}
          >
            <span className="icon"><AssignmentAddIcon fontSize="small" /></span>
            <span className="label" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Crear Tarea</span>
          </Button>
        )}
      </Box>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <Box 
          ref={setNodeRef}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            flexGrow: 1, // Permite que el área de soltado crezca hasta el final de la tarjeta
            minHeight: '300px', // Garantiza un área mínima clickable incluso si está vacío
            width: '100%'
          }}>
          {Object.entries(groupedTasks).map(([storyId, storyData]) => (
            <Box key={storyId} sx={{ mb: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold', color: '#000000', mb: 1, pl: 1,
                  borderLeft: '4px solid var(--oracle-red)',
                  background: 'linear-gradient(90deg, rgba(199, 69, 52, 0.12) 0%, rgba(199, 69, 52, 0.01) 100%)',
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
            <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 4 }}>
              No Hay Tareas
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
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [sprintConfig, setSprintConfig] = useState({ durationWeeks: 2, firstSprintStartDate: new Date().toISOString().split('T')[0] })
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [priorities, setPriorities] = useState([])
  const [userStories, setUserStories] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', storyPoints: '', objetiveTime: '', priorityId: '', userStoryId: '', sprintId: '', assignedUserId: '' })
  const [openMenu, setOpenMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [initialContainer, setInitialContainer] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const findContainer = (id) => {
    if (!id) return null;
    if (id in columns) {
      return id;
    }
    for (const key of Object.keys(columns)) {
      if (
        columns[key].tasks.some(
          item => String(item.id) === String(id)
        )
      ) {
        return key;
      }
    }
    return null;
  };
  const handleDragStart = (event) => {
    const { active } = event;
    const container = findContainer(active.id);
    setInitialContainer(container);
    const allTasks = Object.values(columns).flatMap(col => col.tasks);
    const task = allTasks.find(t => String(t.id) === String(active.id));
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    console.log("OVER:", event.over);
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);

    const overContainer =
      overId in columns
        ? overId
        : findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeContainer].tasks;
      const overItems = prev[overContainer].tasks;

      const activeIndex = activeItems.findIndex(
        item => String(item.id) === activeId
      );

      if (activeIndex === -1) return prev;

      const movingTask = activeItems[activeIndex];

      const overIndex = overItems.findIndex(
        item => String(item.id) === overId
      );

      const isOverContainer = overId in prev;

      const insertIndex = isOverContainer
        ? overItems.length
        : (overIndex >= 0 ? overIndex : overItems.length);

      return {
        ...prev,

        [activeContainer]: {
          ...prev[activeContainer],
          tasks: activeItems.filter(
            item => String(item.id) !== activeId
          )
        },

        [overContainer]: {
          ...prev[overContainer],
          tasks: [
            ...overItems.slice(0, insertIndex),
            movingTask,
            ...overItems.slice(insertIndex)
          ]
        }
      };
    });
  };
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null); 
    if (!over) return;

    const from = initialContainer;
    const to = findContainer(over.id);
    if (!from || !to || from === to) return;

    const taskId = active.id;
    try {
      if (to === 'backlog') {
        await fetch(`/tasks/${taskId}/unassign`, { method: 'PUT' });
      } else if (to.startsWith('sprint-col-')) {
        const sprintId = to.replace('sprint-col-', '');
        await fetch(`/tasks/${taskId}/assign/${sprintId}`, { method: 'PUT' });
      }
    } catch (error) {
      console.error('Error updating task assignment:', error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true)
      const allProjectTasksRes = await fetch('/tasks')
      const allProjectTasks = await allProjectTasksRes.json()
      const taskDetailsById = Array.isArray(allProjectTasks) ? allProjectTasks.reduce((acc, task) => {
        if (task?.taskId !== undefined) acc[String(task.taskId)] = task
        return acc
      }, {}) : {}

      const unassignedRes = await fetch(`/tasks/unassigned/project/${selectedProjectId}`)
      const unassignedTasks = await unassignedRes.json()
      const hierarchyRes = await fetch(`/sprints/project/${selectedProjectId}/hierarchy`)
      let sprintsHierarchy = await hierarchyRes.json()
      const usersRes = await fetch(`/team/project/${selectedProjectId}`)
      const teamMembers = await usersRes.json()
      setUsers(Array.isArray(teamMembers) ? teamMembers : [])

      const newColumns = {
        'backlog': {
          title: 'Backlog',
          tasks: Array.isArray(unassignedTasks) ? unassignedTasks.map(t => {
            const taskId = (t.taskId ?? '').toString()
            const fullTask = taskDetailsById[taskId] || t
            return {
              id: taskId,
              title: fullTask.title || t.title || 'Sin título',
              description: fullTask.description || t.description || '',
              userStoryId: fullTask.userStory?.userStoriesId || t.userStory?.userStoriesId || 'none',
              userStoryName: fullTask.userStory?.name || t.userStory?.name || 'Sin historia',
              priorityId: fullTask.priority?.priorityId || t.priority?.priorityId || '',
              storyPoints: fullTask.storyPoints || t.storyPoints || '',
              objetiveTime: fullTask.objetiveTime || t.objetiveTime || '',
              statusName: fullTask.status?.status || t.status?.status || 'SIN ESTATUS',
              assignedUserId: t.assignedUserId || (t.taskUser?.userId || t.assignedUser?.userId || ''),
              sprintId: null
            }
          }) : []
        }
      }

      let sprintsArray = Array.isArray(sprintsHierarchy) ? sprintsHierarchy : (sprintsHierarchy?.sprints || []);
      const orderedSprints = [...sprintsArray].sort((a, b) => (a.sprintNum ?? 0) - (b.sprintNum ?? 0));
      
      setAvailableSprints(orderedSprints.map(s => ({ id: (s.sprintId ?? '').toString(), number: s.sprintNum ?? 0 })));

      orderedSprints.forEach(sprint => {
        const sId = (sprint.sprintId ?? '').toString();
        if (sId) {
          const colId = `sprint-col-${sId}`;
          newColumns[colId] = {
            title: `Sprint ${sprint.sprintNum ?? '?'}`,
            tasks: Array.isArray(sprint.tasks) ? sprint.tasks.map(t => {
              const taskId = (t.taskId ?? t.id ?? '').toString()
              const fullTask = taskDetailsById[taskId] || t
              return {
                id: taskId,
                title: fullTask.title || t.title || 'Sin título',
                description: fullTask.description || t.description || '',
                userStoryId: fullTask.userStory?.userStoriesId || 'none',
                userStoryName: fullTask.userStory?.name || 'Sin historia',
                priorityId: fullTask.priority?.priorityId || '',
                storyPoints: fullTask.storyPoints || '',
                objetiveTime: fullTask.objetiveTime || '',
                statusName: fullTask.status?.status || 'SIN ESTATUS',
                assignedUserId: t.assignedUserId || (t.taskUser?.userId || ''),
                sprintId: sId
              }
            }).filter(t => t.id) : []
          };
        }
      });

      setColumns(newColumns);
      const [prioritiesRes, userStoriesRes] = await Promise.all([fetch('/priorities'), fetch('/userStories')])
      setPriorities(await prioritiesRes.json()); setUserStories(await userStoriesRes.json());
    } catch (error) { console.error('Error in fetchData:', error) } finally { setLoading(false) }
  }, [selectedProjectId]);

  useEffect(() => { fetchData() }, [fetchData])

  const getVisibleColumns = () => {
    const backlogKey = 'backlog';
    if (selectedSprintId === null) {
      const sprintKeys = Object.keys(columns).filter(k => k.startsWith('sprint-col-'))
        .sort((a, b) => {
          const sA = availableSprints.find(s => `sprint-col-${s.id}` === a);
          const sB = availableSprints.find(s => `sprint-col-${s.id}` === b);
          return (sA?.number || 0) - (sB?.number || 0);
        });
      return [backlogKey, ...sprintKeys].filter(k => columns[k]);
    }
    return [backlogKey, `sprint-col-${selectedSprintId}`].filter(k => columns[k]);
  };

  const visibleColumnsToRender = getVisibleColumns();
  const isSprintSelected = selectedSprintId !== null;
  const visibleColumnCount = isSprintSelected ? 2 : 4;

  const handleCreateSprint = async () => {
    try {
      if (!selectedProjectId) return;
      const resHierarchy = await fetch(`/sprints/project/${selectedProjectId}/hierarchy`);
      const hierarchyData = await resHierarchy.json();
      let sprintsArray = Array.isArray(hierarchyData) ? hierarchyData : (hierarchyData?.sprints || []);
      const sortedSprints = [...sprintsArray].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

      let startDate = sortedSprints.length > 0 
        ? new Date(new Date(sortedSprints[sortedSprints.length - 1].endDate).getTime() + 86400000)
        : new Date(sprintConfig.firstSprintStartDate + 'T00:00:00');

      const endDate = new Date(startDate.getTime() + (sprintConfig.durationWeeks * 7 * 86400000) - 86400000);
      const formatDate = (d) => d.toISOString().split('.')[0];

      const res = await fetch(`/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: { projectId: selectedProjectId }, startDate: formatDate(startDate), endDate: formatDate(endDate) })
      });

      if (!res.ok) throw new Error(await res.text());
      await fetchData(); 
    } catch (error) { console.error('Error creating sprint:', error); alert("No se pudo crear el sprint."); }
    finally { setOpenDialog(false); }
  };

  const handleOpenAddTask = () => { setIsEditing(false); setNewTask({ taskId: null, title: '', description: '', storyPoints: '', objetiveTime: '', priorityId: '', userStoryId: '', sprintId: '', assignedUserId: '' }); setOpenTaskDialog(true); }
  const handleOpenEditTask = (task) => { setIsEditing(true); setNewTask({ taskId: task.id, title: task.title, description: task.description, storyPoints: task.storyPoints || '', objetiveTime: task.objetiveTime || '', priorityId: task.priorityId || '', userStoryId: task.userStoryId === 'none' ? '' : task.userStoryId, sprintId: task.sprintId || '', assignedUserId: task.assignedUserId || '' }); setOpenTaskDialog(true); }

  const handleSaveTask = async () => {
    try {
      if (!newTask.title || !newTask.priorityId || !newTask.userStoryId) { alert('Por favor completa los campos obligatorios'); return; }
      const res = await fetch('/tasks/atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: isEditing ? newTask.taskId : null, title: newTask.title, description: newTask.description, projectId: selectedProjectId, userStoryId: newTask.userStoryId, priorityId: newTask.priorityId, storyPoints: parseInt(newTask.storyPoints) || 0, objectiveTime: parseInt(newTask.objetiveTime) || 0, sprintId: newTask.sprintId || null, assignedUserId: newTask.assignedUserId || null })
      });
      if (!res.ok) throw new Error('Error saving task');
      await fetchData(); setOpenTaskDialog(false);
    } catch (error) { alert('Error al guardar la tarea'); }
  };

  const confirmDeleteTask = async () => {
    try {
      if (!newTask.taskId) return;
      const userData = JSON.parse(localStorage.getItem('user'));
      const userId = userData?.userId || '';
      const res = await fetch(`/tasks/${newTask.taskId}?userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting task');
      setOpenDeleteDialog(false);
      setOpenTaskDialog(false);
      await fetchData();
    } catch (error) { 
      console.error('Delete error:', error);
      alert('Error al eliminar la tarea'); 
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <Box sx={{ flexGrow: 2, mt: 4, px: { xs: 1, md: 3, lg: 4 }, width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ 
            display: 'flex', pb: 1, pt: 4, overflowX: 'auto', width: '100%', transform: 'scaleY(-1)',
            '&::-webkit-scrollbar': { height: '10px' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#b3b3b3' }
          }}>
            <Box sx={{ display: 'flex', width: isSprintSelected ? '100%' : 'max-content', alignItems: 'stretch', gap: 2.5 }}>
              {visibleColumnsToRender.map((id) => (
                <Column key={id} id={id} title={columns[id].title} tasks={columns[id].tasks} visibleColumnCount={visibleColumnCount} onAddTask={handleOpenAddTask} onEditTask={handleOpenEditTask} isSticky={id === 'backlog'} />
              ))}
            </Box>
          </Box>
        </Box>

        <DragOverlay zIndex={2000}>
          {activeTask ? (
            <Box className="devs-task-card" sx={{ boxShadow: '0 10px 20px rgba(0,0,0,0.3)', cursor: 'grabbing', width: '280px' }}>
              <TaskCardContent task={activeTask} />
            </Box>
          ) : null}
        </DragOverlay>

        {/* Floating UI Elements */}
        <Box sx={{ position: 'fixed', top: 110, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 1100 }}>
          {openMenu && (
            <Button variant="contained" onClick={() => { setSelectedSprintId(null); setOpenMenu(false); }} sx={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', mb: 1.5, width: '2.2rem', height: '2.2rem', minWidth: 0, padding: 0, borderRadius: '50%', backgroundColor: '#555', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <RefreshIcon sx={{ fontSize: '1.1rem' }} />
            </Button>
          )}
          <Button variant="contained" onClick={() => setOpenMenu(prev => !prev)} sx={{ width: '2.8rem', height: '2.8rem', minWidth: 0, padding: 0, borderRadius: '50%', backgroundColor: '#cc0707', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15) !important' }}>
            <ViewWeekIcon sx={{ fontSize: '1.4rem' }} />
          </Button>
          {openMenu && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
              {availableSprints.map((s) => (
                <IconButton key={s.id} onClick={() => { setSelectedSprintId(s.id); setOpenMenu(false); }} sx={{ width: '2.2rem', height: '2.2rem', backgroundColor: 'white', border: '1px solid #ccc', fontSize: '0.8rem' }}>{s.number}</IconButton>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ position: 'fixed', bottom: 70, right: 40, zIndex: 1100 }}>
          <Button className="nav-button icon-btn" onClick={() => setOpenDialog(true)} sx={{ backgroundColor: '#cc0707 !important', color: 'white !important', minWidth: '50px !important', height: '50px !important', borderRadius: '50px !important', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.4s ease !important', '&:hover': { padding: '0 20px !important', backgroundColor: '#a30606 !important' } }}>
            <span className="icon"><AddIcon /></span>
            <span className="label" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Crear Sprint</span>
          </Button>
        </Box>

        {/* Dialogs */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Crear nuevo Sprint</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Duración (Semanas)" type="number" fullWidth value={sprintConfig.durationWeeks} onChange={(e) => setSprintConfig({ ...sprintConfig, durationWeeks: parseInt(e.target.value) || 1 })} />
              {availableSprints.length === 0 && <TextField label="Fecha de Inicio" type="date" fullWidth InputLabelProps={{ shrink: true }} value={sprintConfig.firstSprintStartDate} onChange={(e) => setSprintConfig({ ...sprintConfig, firstSprintStartDate: e.target.value })} />}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateSprint} variant="contained" sx={{ backgroundColor: 'var(--oracle-red)' }}>Crear</Button>
          </DialogActions>
        </Dialog>

        <Drawer anchor="right" open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} PaperProps={{ sx: { width: { xs: '100%', sm: '50vw' }, display: 'flex', flexDirection: 'column' } }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</Typography>
            <IconButton onClick={() => setOpenTaskDialog(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Nombre de la tarea" fullWidth value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <TextField label="Descripción" fullWidth multiline rows={4} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Story Points" type="number" fullWidth value={newTask.storyPoints} onChange={(e) => setNewTask({ ...newTask, storyPoints: e.target.value })} />
              <TextField label="Tiempo Estimado (horas)" type="number" fullWidth value={newTask.objetiveTime} onChange={(e) => setNewTask({ ...newTask, objetiveTime: e.target.value })} />
            </Box>
            <FormControl fullWidth><InputLabel>Prioridad</InputLabel><MuiSelect label="Prioridad" value={newTask.priorityId} onChange={(e) => setNewTask({ ...newTask, priorityId: e.target.value })}>{priorities.map(p => <MenuItem key={p.priorityId} value={p.priorityId}>{p.priorityName}</MenuItem>)}</MuiSelect></FormControl>
            <FormControl fullWidth><InputLabel>Historia de Usuario</InputLabel><MuiSelect label="Historia de Usuario" value={newTask.userStoryId} onChange={(e) => setNewTask({ ...newTask, userStoryId: e.target.value })}>{userStories.map(us => <MenuItem key={us.userStoriesId} value={us.userStoriesId}>{us.name}</MenuItem>)}</MuiSelect></FormControl>
            <FormControl fullWidth><InputLabel>Desarrollador</InputLabel><MuiSelect label="Desarrollador" value={newTask.assignedUserId} onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}><MenuItem value=""><em>Sin asignar</em></MenuItem>{users.map((u) => (<MenuItem key={u.userId} value={u.userId}>{u.firtsName} {u.lastName}</MenuItem>))}</MuiSelect></FormControl>
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isEditing && <IconButton onClick={() => setOpenDeleteDialog(true)} sx={{ color: 'black', '&:hover': { color: '#cc0707' } }}><DeleteIcon /></IconButton>}
            <Box sx={{ display: 'flex', gap: 2 }}><Button onClick={() => setOpenTaskDialog(false)}>Cancelar</Button><Button onClick={handleSaveTask} variant="contained" sx={{ backgroundColor: '#cc0707' }}>{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</Button></Box>
          </Box>
        </Drawer>

        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>¿Eliminar tarea?</DialogTitle>
          <DialogContent><DialogContentText>¿Estás seguro de que deseas eliminar la tarea "<strong>{newTask.title}</strong>"?</DialogContentText></DialogContent>
          <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button><Button onClick={confirmDeleteTask} variant="contained" sx={{ backgroundColor: '#cc0707' }}>Eliminar</Button></DialogActions>
        </Dialog>
        
        <Footer />
      </Box>
    </DndContext>
  );
}

export default Sprints;