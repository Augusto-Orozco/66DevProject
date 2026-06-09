import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import Footer from '../components/Footer';
import '../Assets/styles.css';

const Roadmap = ({ selectedProjectId }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [team, setTeam] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
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
      
      // Ordenar sprints por número
      const sortedSprints = [...sprintsArray].sort((a, b) => {
        const numA = a.sprintNum ?? a.SPRINT_NUM ?? 0;
        const numB = b.sprintNum ?? b.SPRINT_NUM ?? 0;
        return numA - numB;
      });
      
      setSprints(sortedSprints);

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

      // 5. Fetch Task History
      const historyRes = await fetch(`/tasks/history/project/${selectedProjectId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setTaskHistory(Array.isArray(historyData) ? historyData : []);
      }

    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const { timelineStart, daysCount, monthLabels } = useMemo(() => {
    let start, end;

    const allStartDates = [
      ...sprints.map(s => new Date(s.startDate || s.START_DATE)),
      ...tasks.map(t => new Date(t.createdAt))
    ].filter(d => !isNaN(d));

    const allEndDates = [
      ...sprints.map(s => new Date(s.endDate || s.END_DATE)),
      ...tasks.map(t => new Date(t.finishedAt || t.createdAt))
    ].filter(d => !isNaN(d));

    if (allStartDates.length > 0) {
      // Encontrar la fecha mínima y máxima absoluta
      const minDate = new Date(Math.min(...allStartDates));
      const maxDate = new Date(Math.max(...allEndDates));

      // Ajustar al inicio del primer mes y al final del último mes para que se vea completo
      start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    } else {
      // Rango por defecto si no hay datos (3 meses desde hoy)
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate Month Labels
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
  }, [sprints, tasks]);

  // Cálculo del ancho total de la línea de tiempo
  const timelineMinWidth = useMemo(() => {
    const monthsCount = monthLabels.length;
    // Si hay más de 5 meses, forzamos un ancho mínimo para habilitar el scroll
    if (monthsCount > 5) {
      return `${(monthsCount / 5) * 100}%`;
    }
    return '100%';
  }, [monthLabels]);

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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa' 
    }}>
      <Box sx={{ p: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Roadmap del Proyecto
          </Typography>

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
              <Tab label="Historial de cambios" sx={{ fontWeight: 'bold', textTransform: 'none' }} />
            </Tabs>
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '12px', 
          overflow: 'hidden',
          backgroundColor: 'white',
        }}>
          {/* Contenedor con Scroll Horizontal pegado al contenido */}
          <Box sx={{ 
            width: '100%', 
            overflowX: 'auto',
            // Estilos para la barra de scroll para que se vea integrada
            '&::-webkit-scrollbar': { height: '10px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '5px' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#b3b3b3' }
          }}>

            <Box sx={{ width: timelineMinWidth }}>
              {/* Timeline Header (Months) - Oculto en Tab de Historial */}
              {currentTab !== 2 && (
                <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#f1f3f4', borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 2, borderRight: '1px solid #e0e0e0', backgroundColor: '#f1f3f4', zIndex: 10, position: 'sticky', left: 0 }} />
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
              )}

              {/* Timeline Content */}
              <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>

                {/* TAB 0: SPRINTS VIEW */}
                {currentTab === 0 && (
                  <>
                    <Box sx={{ display: 'flex', backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 1, borderRight: '1px solid #e0e0e0', backgroundColor: '#fafafa', position: 'sticky', left: 0, zIndex: 5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#999', ml: 1 }}>LISTADO DE SPRINTS</Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                    </Box>
                    {sprints.map((sprint, i) => (
                      <Box key={i} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', height: '50px', '&:hover': { backgroundColor: '#fcfcfc' } }}>
                        <Box sx={{ minWidth: '250px', maxWidth: '250px', p: 1.5, borderRight: '1px solid #e0e0e0', fontSize: '0.85rem', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', backgroundColor: 'white', position: 'sticky', left: 0, zIndex: 5 }}>
                          Sprint {sprint.sprintNum ?? sprint.SPRINT_NUM ?? '?'}
                        </Box>
                        <Box sx={{ flexGrow: 1, position: 'relative', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                          <Tooltip title={`Sprint ${sprint.sprintNum ?? sprint.SPRINT_NUM}: ${new Date(sprint.startDate || sprint.START_DATE).toLocaleDateString()} - ${new Date(sprint.endDate || sprint.END_DATE).toLocaleDateString()}`}>
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
                              Sprint {sprint.sprintNum ?? sprint.SPRINT_NUM ?? '?'}
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
                              {i > 0 && <Box sx={{ width: '4px', height: '100%', backgroundColor: getDevColor(devId), position: 'absolute', left: 0 }} />}
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
                  ))
                )}

                {/* TAB 2: CHANGE HISTORY VIEW */}
                {currentTab === 2 && (
                  <Box sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', backgroundColor: '#fafafa', borderBottom: '1px solid #eee', py: 1, px: 2, position: 'sticky', left: 0, zIndex: 5 }}>
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', color: '#999' }}>FECHA</Typography>
                      <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold', color: '#999' }}>TAREA</Typography>
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', color: '#999' }}>USUARIO</Typography>
                      <Typography variant="caption" sx={{ flex: 3, fontWeight: 'bold', color: '#999' }}>CAMBIOS / NOTAS</Typography>
                    </Box>
                    {taskHistory.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>No hay historial de cambios disponible para este proyecto.</Typography>
                      </Box>
                    ) : (
                      taskHistory.map((history, i) => (
                        <Box key={i} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', py: 2, px: 2, '&:hover': { backgroundColor: '#fcfcfc' }, alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ flex: 1, color: '#666', fontSize: '0.8rem' }}>
                            {new Date(history.changedAt).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', color: '#333' }}>
                            {history.task?.title || "Tarea Desconocida"}
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 1, color: '#555' }}>
                            {history.user ? `${history.user.firtsName} ${history.user.lastName}` : "Usuario"}
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 3, color: '#444' }}>
                            {history.changes}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Legend */}
        {currentTab !== 2 && (
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {currentTab === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '4px', border: '2px solid var(--oracle-red)', backgroundColor: 'rgba(199, 69, 52, 0.2)' }} />
                <Typography variant="caption" fontWeight="bold">Sprints</Typography>
              </Box>
            )}

            {currentTab === 1 && (
              <>
                <Typography variant="caption" sx={{ color: '#666' }}>Desarrollador:</Typography>
                {team.map(member => (
                  <Box key={member.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getDevColor(member.userId) }} />
                    <Typography variant="caption">{member.firtsName}</Typography>
                  </Box>
                ))}
              </>
            )}
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
  };

export default Roadmap;
