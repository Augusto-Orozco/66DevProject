import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Tooltip,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import '../Assets/styles.css';

const Roadmap = ({ selectedProjectId }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [team, setTeam] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (selectedProjectId) {
      fetchData();
    }
  }, [selectedProjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Team to get developer names and map colors
      const teamRes = await fetch(`/team/project/${selectedProjectId}`);
      const teamData = await teamRes.json();
      setTeam(Array.isArray(teamData) ? teamData : []);

      // 2. Fetch Sprints with hierarchy to get dates
      const sprintsRes = await fetch(`/sprints/project/${selectedProjectId}/hierarchy`);
      const sprintsData = await sprintsRes.json();
      
      let sprintsArray = [];
      if (Array.isArray(sprintsData)) {
        sprintsArray = sprintsData;
      } else if (sprintsData && typeof sprintsData === 'object') {
        sprintsArray = sprintsData.sprints || sprintsData.SPRINTS || [];
      }
      setSprints(sprintsArray);

      // 3. Fetch all tasks and filter by project
      const tasksRes = await fetch(`/tasks`);
      const allTasks = await tasksRes.json();
      const projectTasks = allTasks.filter(t => t.project?.projectId === selectedProjectId);

      // 4. Fetch Assignments to map tasks to users correctly
      const assignmentsRes = await fetch(`/tasks/assignments/project/${selectedProjectId}`);
      if (assignmentsRes.ok) {
        const assignments = await assignmentsRes.json();
        const assignmentMap = Array.isArray(assignments) ? assignments.reduce((acc, curr) => {
          const tId = curr.task?.taskId || curr.taskId;
          if (tId) acc[String(tId)] = curr.user?.userId || curr.userId;
          return acc;
        }, {}) : {};

        // Enriquecer tareas con el userId del desarrollador
        const enrichedTasks = projectTasks.map(task => ({
          ...task,
          assignedDevId: assignmentMap[String(task.taskId)] || 'unassigned'
        }));
        setTasks(enrichedTasks);
      } else {
        setTasks(projectTasks.map(t => ({ ...t, assignedDevId: 'unassigned' })));
      }

    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by developer
  const tasksByDev = useMemo(() => {
    const grouped = tasks.reduce((acc, task) => {
      const devId = String(task.assignedDevId || 'unassigned');
      if (!acc[devId]) acc[devId] = [];
      acc[devId].push(task);
      return acc;
    }, {});
    
    // Asegurarnos de que todos los miembros del equipo aparezcan aunque no tengan tareas
    team.forEach(member => {
      const id = String(member.userId);
      if (!grouped[id]) grouped[id] = [];
    });

    return grouped;
  }, [tasks, team]);

  const getDevName = (devId) => {
    if (devId === 'unassigned') return 'Sin Asignar';
    const dev = team.find(u => String(u.userId) === String(devId));
    return dev ? `${dev.firtsName} ${dev.lastName}` : `Dev ${devId}`;
  };

  const getDevColor = (devId) => {
    if (devId === 'unassigned') return '#9e9e9e';
    const colors = ['#d32f2f', '#1976d2', '#388e3c', '#fbc02d', '#7b1fa2', '#e64a19', '#0097a7'];
    const index = team.findIndex(u => String(u.userId) === String(devId));
    return colors[index % colors.length] || colors[0];
  };

  // Timeline Logic
  const { timelineStart, timelineEnd, daysCount, monthLabels } = useMemo(() => {
    // Forzamos el rango de Febrero a Julio de 2026
    const start = new Date(2026, 2, 1); // Marzo 1
    const end = new Date(2026, 5, 30); // Junio 30

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate Month Labels
    const labels = [];
    let current = new Date(start);
    while (current <= end) {
      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      labels.push({
        name: current.toLocaleString('default', { month: 'long' }),
        days: daysInMonth,
        startDay: Math.ceil((current - start) / (1000 * 60 * 60 * 24))
      });
      current.setMonth(current.getMonth() + 1);
    }

    return { timelineStart: start, timelineEnd: end, daysCount: diffDays, monthLabels: labels };
  }, [tasks, sprints]);

  // Funciones para calcular posición y ancho en porcentajes (0% a 100%)
  const getPositionPercent = (dateStr) => {
    if (!dateStr) return '0%';
    const date = new Date(dateStr);
    const diff = date - timelineStart;
    const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${(dayIndex / daysCount) * 100}%`;
  };

  const getWidthPercent = (startStr, endStr, durationDays = 3) => {
    const start = new Date(startStr);
    let end = endStr ? new Date(endStr) : new Date(start);
    if (!endStr) end.setDate(end.getDate() + durationDays);

    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${(days / daysCount) * 100}%`; 
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: 'var(--oracle-red)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          
        </Typography>
        
        {/* Tabs dentro de la misma tabla (acomodado con Paper) */}
        <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, v) => setCurrentTab(v)}
            sx={{ 
              '& .MuiTabs-indicator': { backgroundColor: 'var(--oracle-red)' },
              '& .Mui-selected': { color: 'var(--oracle-red) !important' }
            }}
          >
            <Tab label="Sprints" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
            <Tab label="Desarrolladores" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
          </Tabs>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '12px', 
        overflow: 'hidden',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Contenedor principal responsive */}
        <Box sx={{ position: 'relative', width: '100%' }}>

          {/* Timeline Header (Months) */}
          <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#f1f3f4', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 2, borderRight: '1px solid #e0e0e0', backgroundColor: '#f1f3f4', zIndex: 10 }} />
            <Box sx={{ flexGrow: 1, position: 'relative', height: '50px' }}>
              {monthLabels.map((month, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    position: 'absolute', 
                    left: `${(month.startDay / daysCount) * 100}%`,
                    width: `${(month.days / daysCount) * 100}%`,
                    height: '100%',
                    borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#555',
                    textTransform: 'capitalize',
                    backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                    boxSizing: 'border-box'
                  }}
                >
                  {month.name}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Timeline Content */}
          <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'hidden' }}>

            {/* TAB 0: SPRINTS VIEW */}
            {currentTab === 0 && (
              <>
                <Box sx={{ display: 'flex', backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                  <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 1, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#999', ml: 1 }}>LISTADO DE SPRINTS</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                </Box>
                {sprints.map((sprint, i) => (
                  <Box key={i} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', height: '50px', '&:hover': { backgroundColor: '#fcfcfc' } }}>
                    <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 1.5, borderRight: '1px solid #e0e0e0', fontSize: '0.85rem', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                      Sprint {sprint.sprintNum || sprint.SPRINT_NUM}
                    </Box>
                    <Box sx={{ flexGrow: 1, position: 'relative', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                      <Tooltip title={`Sprint ${sprint.sprintNum}: ${new Date(sprint.startDate || sprint.START_DATE).toLocaleDateString()} - ${new Date(sprint.endDate || sprint.END_DATE).toLocaleDateString()}`}>
                        <Box sx={{ 
                          position: 'absolute',
                          left: getPositionPercent(sprint.startDate || sprint.START_DATE),
                          width: getWidthPercent(sprint.startDate || sprint.START_DATE, sprint.endDate || sprint.END_DATE),
                          height: '24px',
                          top: '13px',
                          backgroundColor: 'rgba(199, 69, 52, 0.15)',
                          border: '2px solid var(--oracle-red)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          px: 1,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          color: 'var(--oracle-red)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          zIndex: 2,
                          boxSizing: 'border-box'
                        }}>
                          Sprint {sprint.sprintNum}
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </>
            )}

            {/* TAB 1: DEVELOPERS VIEW */}
            {currentTab === 1 && (
              Object.entries(tasksByDev).map(([devId, devTasks]) => (
                <Box key={devId} sx={{ borderBottom: '2px solid #eee' }}>
                  {/* Seccion de Desarrollador */}
                  {devTasks.length === 0 ? (
                    // Fila vacía para devs sin tareas
                    <Box sx={{ display: 'flex', borderBottom: '1px solid #f9f9f9', height: '45px' }}>
                      <Box sx={{ 
                        minWidth: '250px', 
                        maxWidth: '250px', 
                        p: 1.5, 
                        borderRight: '1px solid #e0e0e0', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold', 
                        color: getDevColor(devId),
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.02)'
                      }}>
                        {getDevName(devId)}
                      </Box>
                      <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', pl: 2 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>Sin tareas asignadas</Typography>
                      </Box>
                    </Box>
                  ) : (
                    devTasks.map((task, i) => (
                      <Box key={i} sx={{ display: 'flex', borderBottom: '1px solid #f9f9f9', height: '45px', '&:hover': { backgroundColor: '#fcfcfc' } }}>
                        {/* Sidebar con Nombre del Dev (Solo en la primera fila del grupo o en todas para claridad) */}
                        <Box sx={{ 
                          minWidth: '250px', 
                          maxWidth: '250px', 
                          p: 1.5, 
                          borderRight: '1px solid #e0e0e0', 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold', 
                          color: getDevColor(devId),
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: i === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                          position: 'relative'
                        }}>
                          {i === 0 ? getDevName(devId) : ""}
                          {i > 0 && <Box sx={{ width: '4px', height: '100%', backgroundColor: getDevColor(devId), position: 'absolute', left: 0 }} />}
                        </Box>

                        {/* Timeline de la Tarea */}
                        <Box sx={{ flexGrow: 1, position: 'relative' }}>
                          <Tooltip title={`${task.title} (Status: ${task.status?.status || 'N/A'})`}>
                            <Box sx={{ 
                              position: 'absolute',
                              left: getPositionPercent(task.createdAt),
                              width: getWidthPercent(task.createdAt, task.finishedAt, task.storyPoints || 2),
                              minWidth: '20px',
                              height: '28px',
                              top: '8px',
                              backgroundColor: getDevColor(devId),
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              px: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: 'white',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                              zIndex: 3
                            }}>
                              {task.title}
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '4px', border: '2px solid var(--oracle-red)', backgroundColor: 'rgba(199, 69, 52, 0.2)' }} />
          <Typography variant="caption" fontWeight="bold">Sprints</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Typography variant="caption" sx={{ color: '#666' }}>Colores en tareas indican el Desarrollador asignado</Typography>
        {team.map(member => (
          <Box key={member.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getDevColor(member.userId) }} />
            <Typography variant="caption">{member.firtsName}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Roadmap;
