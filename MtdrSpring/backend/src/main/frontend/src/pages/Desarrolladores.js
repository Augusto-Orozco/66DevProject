import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Tooltip } from '@mui/material';
import Footer from '../components/Footer';
import '../Assets/styles.css';

const Desarrolladores = ({ selectedProjectId }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      
      // Fetch de desarrolladores por equipo
      const teamRes = await fetch(`/team/project/${selectedProjectId}`);
      const teamData = await teamRes.json();
      setTeam(Array.isArray(teamData) ? teamData : []);

      // Fetch de tareas del proyecto
      const tasksRes = await fetch(`/tasks`);
      const allTasks = await tasksRes.json();
      const projectTasks = allTasks.filter(t => t.project?.projectId === selectedProjectId);

      // Fetch de asignaciones para mapear tareas a desarrolladores
      const assignmentsRes = await fetch(`/tasks/assignments/project/${selectedProjectId}`);
      if (assignmentsRes.ok) {
        const assignments = await assignmentsRes.json();
        const assignmentMap = Array.isArray(assignments) ? assignments.reduce((acc, curr) => {
          const tId = curr.task?.taskId || curr.taskId;
          if (tId) acc[String(tId)] = curr.user?.userId || curr.userId;
          return acc;
        }, {}) : {};

        const enrichedTasks = projectTasks.map(task => ({
          ...task,
          assignedDevId: assignmentMap[String(task.taskId)] || 'unassigned'
        }));
        setTasks(enrichedTasks);
      } else {
        setTasks(projectTasks.map(t => ({ ...t, assignedDevId: 'unassigned' })));
      }

    } catch (error) {
      console.error("Error fetching developers data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Agrupar tareas por desarrollador
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

  // Timeline
  const { timelineStart, daysCount, monthLabels } = useMemo(() => {
    let start, end;

    const allStartDates = [
      ...tasks.map(t => new Date(t.createdAt))
    ].filter(d => !isNaN(d));

    const allEndDates = [
      ...tasks.map(t => new Date(t.finishedAt || t.createdAt))
    ].filter(d => !isNaN(d));

    if (allStartDates.length > 0) {
      const minDate = new Date(Math.min(...allStartDates));
      const maxDate = new Date(Math.max(...allEndDates));

      start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const labels = [];
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      labels.push({
        name: current.toLocaleString('default', { month: 'long' }),
        days: daysInMonth,
        startDay: Math.ceil((current - start) / (1000 * 60 * 60 * 24))
      });
      current.setMonth(current.getMonth() + 1);
    }

    return { timelineStart: start, timelineEnd: end, daysCount: diffDays, monthLabels: labels };
  }, [tasks]);

  const timelineMinWidth = useMemo(() => {
    const monthsCount = monthLabels.length;
    if (monthsCount > 5) {
      return `${(monthsCount / 5) * 100}%`;
    }
    return '100%';
  }, [monthLabels]);

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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#F1EFED' 
    }}>
      <Box sx={{ p: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Tareas asignadas
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '12px', 
          overflow: 'hidden',
          backgroundColor: 'white',
        }}>
          <Box sx={{ 
            width: '100%', 
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: '10px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '5px' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#b3b3b3' }
          }}>

            <Box sx={{ width: timelineMinWidth }}>
              <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#f1f3f4', borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 2, borderRight: '1px solid #e0e0e0', backgroundColor: '#f1f3f4', zIndex: 10, position: 'sticky', left: 0, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#999', ml: 1 }}>Desarrollador</Typography>
                </Box>
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

              <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                {Object.entries(tasksByDev).map(([devId, devTasks]) => (
                  <Box key={devId} sx={{ borderBottom: '2px solid #eee' }}>
                    {devTasks.length === 0 ? (
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
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          position: 'sticky',
                          left: 0,
                          zIndex: 5
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
                            backgroundColor: i === 0 ? 'rgba(0,0,0,0.02)' : 'white',
                            position: 'sticky',
                            left: 0,
                            zIndex: 5
                          }}>
                            {i === 0 ? getDevName(devId) : ""}
                          </Box>

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
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>

      </Box>
      <Footer />
    </Box>
  );
};

export default Desarrolladores;
