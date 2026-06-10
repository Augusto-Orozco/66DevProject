import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Tooltip } from '@mui/material';
import Footer from '../components/Footer';
import '../Assets/styles.css';

const Roadmap = ({ selectedProjectId }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      
      // Fetch de sprints con jerarquía
      const sprintsRes = await fetch(`/sprints/project/${selectedProjectId}/hierarchy`);
      const sprintsData = await sprintsRes.json();
      
      let sprintsArray = [];
      if (Array.isArray(sprintsData)) {
        sprintsArray = sprintsData;
      } else if (sprintsData && typeof sprintsData === 'object') {
        sprintsArray = sprintsData.sprints || sprintsData.SPRINTS || [];
      }
      
      const sortedSprints = [...sprintsArray].sort((a, b) => {
        const numA = a.sprintNum ?? a.SPRINT_NUM ?? 0;
        const numB = b.sprintNum ?? b.SPRINT_NUM ?? 0;
        return numA - numB;
      });
      
      setSprints(sortedSprints);

      // Fetch de tareas del proyecto
      const tasksRes = await fetch(`/tasks`);
      const allTasks = await tasksRes.json();
      const projectTasks = allTasks.filter(t => t.project?.projectId === selectedProjectId);
      setTasks(projectTasks);

    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Timeline
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
  }, [sprints, tasks]);

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

  // Cálculos para indicadores
  const today = useMemo(() => new Date(), []);
  const activeSprints = sprints.filter(s => {
    const start = new Date(s.startDate || s.START_DATE);
    const end = new Date(s.endDate || s.END_DATE);
    return today >= start && today <= end;
  });

  const nextMilestone = useMemo(() => {
    const upcoming = sprints
      .map(s => ({ ...s, end: new Date(s.endDate || s.END_DATE) }))
      .filter(s => s.end >= today)
      .sort((a, b) => a.end - b.end);
    
    if (upcoming.length > 0) {
      const diffTime = upcoming[0].end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { sprintNum: upcoming[0].sprintNum ?? upcoming[0].SPRINT_NUM, days: diffDays };
    }
    return null;
  }, [sprints, today]);

  const averageVelocity = useMemo(() => {
    const startedSprints = sprints.filter(s => new Date(s.startDate || s.START_DATE) <= today);
    if (startedSprints.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status?.status === 'Completado');
    return (completedTasks.length / startedSprints.length).toFixed(1);
  }, [tasks, sprints, today]);

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
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            Roadmap del Proyecto
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            <Box className="base-card" sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Sprint en ejecución
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--oracle-red)' }}>
                  {activeSprints.length > 0 
                    ? activeSprints.map(s => `Sprint ${s.sprintNum ?? s.SPRINT_NUM}`).join(', ')
                    : 'Ninguno'}
                </Typography>
              </Box>
            </Box>

            <Box className="base-card" sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Deadline
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {nextMilestone 
                    ? `Sprint ${nextMilestone.sprintNum} acaba en ${nextMilestone.days} días`
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box className="base-card" sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Velocidad promedio
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {averageVelocity} <Typography component="span" variant="body1" sx={{ ml: 1, color: '#666' }}>tareas/sprint</Typography>
                </Typography>
              </Box>
            </Box>
          </Box>
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

              <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
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
              </Box>
            </Box>
          </Box>
        </Paper>

      </Box>
      <Footer />
    </Box>
  );
};

export default Roadmap;
