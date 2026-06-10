import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

import Footer from '../components/Footer';
import '../Assets/styles.css';

function Dashboard({ selectedProjectId, sprintFilter }) {
  const [items, setItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sprintTasksIds, setSprintTasksIds] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Estados para la lógica de Sprints
  const [sprints, setSprints] = useState([]);
  const [sprintTasksMap, setSprintTasksMap] = useState({});

  // Filtros individuales por gráfica
  const [devFilterTasks, setDevFilterTasks] = useState('all');
  const [devFilterHours, setDevFilterHours] = useState('all');
  const [devFilterEfectividad, setDevFilterEfectividad] = useState('all');

  // --- OBTENCIÓN DE DATOS INTEGRADA ---
  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);

    try {
      const [tasksRes, assignmentsRes] = await Promise.all([
        fetch(`/tasks/project/${selectedProjectId}`),
        fetch(`/tasks/assignments/project/${selectedProjectId}`)
      ]);

      const tasksData = await tasksRes.json();
      const assignmentsData = await assignmentsRes.json();

      setItems(Array.isArray(tasksData) ? tasksData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

      const sprintsRes = await fetch(`/sprints/project/${selectedProjectId}`);
      const sprintsData = await sprintsRes.json();
      
      const sortedSprints = [...sprintsData].sort((a, b) => a.sprintNum - b.sprintNum);
      setSprints(sortedSprints);

      const tasksMap = {};
      for (const sprint of sortedSprints) {
        const stRes = await fetch(`/sprintTasks/${sprint.sprintId}`);
        const stData = await stRes.json();
        tasksMap[sprint.sprintId] = stData.map(st => st.task?.taskId || st.taskId);
      }
      setSprintTasksMap(tasksMap);

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    setDevFilterTasks('all');
    setDevFilterHours('all');
    setDevFilterEfectividad('all');
    fetchData();
  }, [selectedProjectId, fetchData]);

  useEffect(() => {
    if (!sprintFilter || sprintFilter === 'all') {
      setSprintTasksIds([]);
    } else {
      setLoading(true);
      fetch(`/sprintTasks/${sprintFilter}`)
        .then(res => res.json())
        .then(data => {
          const ids = data.map(st => st.task?.taskId || st.taskId);
          setSprintTasksIds(ids);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando tareas del sprint:", err);
          setLoading(false);
        });
    }
  }, [sprintFilter]);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const activeTasks = useMemo(() => {
    let tasks = (!sprintFilter || sprintFilter === 'all')
      ? items 
      : items.filter(t => sprintTasksIds.includes(t.taskId));

    const getPriority = (status) => {
      const s = String(status || '').trim().toLowerCase();
      if (s === 'atrasado') return 1;
      if (s === 'en progreso') return 2;
      if (s === 'completado') return 3;
      return 4;
    };

    return [...tasks].sort((a, b) => {
      const priorityA = getPriority(a.status?.status);
      const priorityB = getPriority(b.status?.status);
      return priorityA - priorityB;
    });
  }, [items, sprintFilter, sprintTasksIds]);

  const activeAssignments = (!sprintFilter || sprintFilter === 'all')
    ? assignments
    : assignments.filter(a => sprintTasksIds.includes(a.task?.taskId));

  const getDeveloperNameForTask = (taskId) => {
    const assignment = activeAssignments.find(a => a.task?.taskId === taskId);
    if (!assignment?.user) return 'Sin asignar';
    return `${assignment.user.firtsName || ''} ${assignment.user.lastName || ''}`.trim() || 'Sin asignar';
  };

  // --- PREPARACIÓN DE DATOS PARA GRÁFICAS ---

  const statusCount = activeTasks.reduce((acc, item) => {
    const status = item.status?.status || 'SIN ESTATUS';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.keys(statusCount).map(key => {
    let color = '#9e9e9e';
    if (key === 'Completado') color = '#4caf50';
    else if (key === 'En Progreso') color = '#fbc02d';
    else if (key === 'Atrasado') color = '#f44336';
    return { name: key, value: statusCount[key], fill: color };
  });

  let totalEstimadoGlobal = 0;
  let totalRealGlobal = 0;

  const devStatsMap = activeAssignments.reduce((acc, a) => {
    if (!a.user || !a.task) return acc;
    const userName = `${a.user.firtsName} ${a.user.lastName}`;
    
    if (!acc[userName]) {
      acc[userName] = { name: userName, estimado: 0, real: 0, totalTareas: 0 };
    }
    
    const estimado = a.task.objetiveTime || 0;
    const real = a.task.realTime || 0;

    acc[userName].estimado += estimado;
    acc[userName].real += real;
    acc[userName].totalTareas += 1;

    totalEstimadoGlobal += estimado;
    totalRealGlobal += real;

    return acc;
  }, {});

  const allDevStats = Object.values(devStatsMap);
  
  const devTasksChartData = allDevStats.filter(dev => devFilterTasks === 'all' || dev.name === devFilterTasks);
  const devHoursChartData = allDevStats.filter(dev => devFilterHours === 'all' || dev.name === devFilterHours);

  const total = activeTasks.length;
  const completed = activeTasks.filter(t => t.status?.status === 'Completado').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sprintProgressData = [
    { name: 'Sprint', completado: progressPercent, restante: 100 - progressPercent }
  ];

  let targetEstimado = totalEstimadoGlobal;
  let targetReal = totalRealGlobal;

  if (devFilterEfectividad !== 'all') {
    const devData = devStatsMap[devFilterEfectividad];
    if (devData) {
      targetEstimado = devData.estimado;
      targetReal = devData.real;
    } else {
      targetEstimado = 0;
      targetReal = 0;
    }
  }

  let efectividadValor = targetReal > 0 
    ? Math.round((targetEstimado / targetReal) * 100) 
    : 0;

  let efectividadColor = '#f44336';
  if (efectividadValor > 75) efectividadColor = '#4caf50'; 
  else if (efectividadValor >= 50) efectividadColor = '#fbc02d';

  const barraEfectividadVisual = efectividadValor > 100 ? 100 : efectividadValor;

  const efectividadBarData = [
    { name: 'Efectividad', valor: barraEfectividadVisual, restante: 100 - barraEfectividadVisual }
  ];


// 5. BURNDOWN CHART DINÁMICO 
  const burndownData = useMemo(() => {
    if (totalEstimadoGlobal === 0) return [];

    
    if (!sprintFilter || sprintFilter === 'all') {
      if (sprints.length === 0) return [];
      
      const data = [{ name: 'Inicio', ideal: totalEstimadoGlobal, real: totalEstimadoGlobal }];
      const idealStep = totalEstimadoGlobal / sprints.length;
      
      let cumulativeObj = 0;
      let cumulativeReal = 0;

      sprints.forEach((sprint, index) => {
        const taskIdsInThisSprint = sprintTasksMap[sprint.sprintId] || [];
        
        taskIdsInThisSprint.forEach(taskId => {
          const task = items.find(t => t.taskId === taskId);
          if (task) {
            cumulativeObj += (task.objetiveTime || 0);
            cumulativeReal += (task.realTime || 0);
          }
        });

       
        const idealPoint = Math.max(0, Math.round(totalEstimadoGlobal - (idealStep * (index + 1))));
        
       
        const remainingObj = Math.max(0, totalEstimadoGlobal - cumulativeObj);
        
        let realPoint = remainingObj; 
        

        if (cumulativeReal > 0 && cumulativeObj > 0) {
          const efficiency = cumulativeObj / cumulativeReal;

          realPoint = remainingObj / efficiency;
        }

        data.push({
          name: sprint.sprintName || `Sprint ${sprint.sprintNum}`,
          ideal: idealPoint,
          real: Math.max(0, Math.round(realPoint))
        });
      });
      return data;
    } 
    else {
      if (activeTasks.length === 0) return [];

      const data = [{ name: 'Inicio', ideal: totalEstimadoGlobal, real: totalEstimadoGlobal }];
      const idealStep = totalEstimadoGlobal / activeTasks.length;
      
      let cumulativeObj = 0;
      let cumulativeReal = 0;

      activeTasks.forEach((task, index) => {
        cumulativeObj += (task.objetiveTime || 0);
        cumulativeReal += (task.realTime || 0);

        const idealPoint = Math.max(0, Math.round(totalEstimadoGlobal - (idealStep * (index + 1))));
        
        const remainingObj = Math.max(0, totalEstimadoGlobal - cumulativeObj);
        
        let realPoint = remainingObj;
        
        if (cumulativeReal > 0 && cumulativeObj > 0) {
          const efficiency = cumulativeObj / cumulativeReal;
          realPoint = remainingObj / efficiency;
        }

        const taskName = task.title 
          ? (task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title) 
          : `T-${index + 1}`;

        data.push({
          name: taskName,
          ideal: idealPoint,
          real: Math.max(0, Math.round(realPoint))
        });
      });

      return data;
    }
  }, [items, sprints, sprintTasksMap, totalEstimadoGlobal, sprintFilter, activeTasks]);
  return (
    <>
    <Box sx={{ pt: 3, px: 3, pb: 4, maxWidth: '100%', margin: '0 auto' }}>
      <Box className="dashboard-grid">
        
        {/* --- FILA 1: ESTADO Y PROGRESO --- */}
        <Box className="base-card" sx={{ gridColumn: 'span 1' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Estado General</Typography>
          {loading ? <CircularProgress /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={35} />
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box className="base-card" sx={{ gridColumn: 'span 1' }}>
          <Typography variant="h6">Progreso General</Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
            {progressPercent}%
          </Typography>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={sprintProgressData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" hide /><Tooltip />
              <Bar dataKey="completado" stackId="a" fill="#4caf50" radius={[4, 0, 0, 4]} />
              <Bar dataKey="restante" stackId="a" fill="#e0e0e0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box className="base-card" sx={{ gridColumn: 'span 2' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tareas Totales</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={devFilterTasks} onChange={(e) => setDevFilterTasks(e.target.value)} displayEmpty sx={{ fontSize: '0.75rem' }}>
                <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos</MenuItem>
                {allDevStats.map(dev => (
                  <MenuItem key={dev.name} value={dev.name} sx={{ fontSize: '0.75rem' }}>{dev.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={devTasksChartData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="totalTareas" fill="#ab47bc" name="Tareas Asignadas" radius={[0, 4, 4, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* --- BURNDOWN CHART --- */}
        <Box className="base-card" sx={{ gridColumn: 'span 4' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Burndown Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="#004fee" 
                name="Esfuerzo Ideal (Hrs)" 
                strokeWidth={3} 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="real" 
                stroke="#ef1e0f" 
                name="Esfuerzo Real (Hrs)" 
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* --- FILA 2: HORAS Y EFECTIVIDAD --- */}
        <Box className="base-card" sx={{ gridColumn: 'span 3' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Horas Estimadas vs Horas Reales</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={devFilterHours} onChange={(e) => setDevFilterHours(e.target.value)} displayEmpty sx={{ fontSize: '0.75rem' }}>
                <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos</MenuItem>
                {allDevStats.map(dev => (
                  <MenuItem key={dev.name} value={dev.name} sx={{ fontSize: '0.75rem' }}>{dev.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={devHoursChartData} margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
              <Tooltip cursor={{fill: '#f5f5f5'}} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="estimado" fill="#42a5f5" name="Horas Estimadas" radius={[0, 4, 4, 0]} maxBarSize={30} />
              <Bar dataKey="real" fill="#ef5350" name="Horas Reales" radius={[0, 4, 4, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box className="base-card" sx={{ gridColumn: 'span 1' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Efectividad</Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select value={devFilterEfectividad} onChange={(e) => setDevFilterEfectividad(e.target.value)} displayEmpty sx={{ fontSize: '0.75rem' }}>
                <MenuItem value="all" sx={{ fontSize: '0.75rem' }}>Todos</MenuItem>
                {allDevStats.map(dev => (
                  <MenuItem key={dev.name} value={dev.name} sx={{ fontSize: '0.75rem' }}>{dev.name.split(' ')[0]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 5, mb: 3, textAlign: 'center', color: efectividadColor }}>
            {efectividadValor}%
          </Typography>
          
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={efectividadBarData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip formatter={(value, name) => [value + '%', name === 'valor' ? 'Efectividad' : '']} />
              <Bar dataKey="valor" stackId="a" fill={efectividadColor} radius={[4, 0, 0, 4]} />
              <Bar dataKey="restante" stackId="a" fill="#e0e0e0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* --- FILA 3: LISTADO DE TAREAS --- */}
        <Box className="base-card" sx={{ gridColumn: 'span 4', alignItems: 'flex-start', justifyContent: 'flex-start', p: 3 }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Listado de Tareas
            </Typography>
            <IconButton size="small" onClick={fetchData} disabled={loading}><CachedIcon /></IconButton>
          </Box>

          {!loading && activeTasks.length > 0 && (
            <Box sx={{ display: 'flex', width: '100%', px: 2, mb: 1, opacity: 0.6 }}>
              <Typography variant="caption" sx={{ flex: 2, fontWeight: 'bold' }}>TAREA</Typography>
              <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>ESTATUS</Typography>
              <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>DESARROLLADOR</Typography>
              <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>PRIORIDAD</Typography>
            </Box>
          )}

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!loading && activeTasks.map((item) => {
              let pCol = '#292929', pBg = '#f5f5f5';
              const priorityName = item.priority?.priorityName;
              if (priorityName === 'Low' || priorityName === 'Baja') { pCol = '#123013'; pBg = '#94e59b'; }
              else if (priorityName === 'Medium' || priorityName === 'Media') { pCol = '#483009'; pBg = '#fff9b9'; }
              else if (priorityName === 'High' || priorityName === 'Alta') { pCol = '#541111'; pBg = '#fdb4bf'; }

              let sCol = '#000000', sBg = '#a9a9a9', border = '#858585';
              const statusStr = item.status?.status;
              if (statusStr === 'Completado') { sCol = '#123013'; sBg = '#94e59b'; border = '#4caf50'; }
              else if (statusStr === 'En Progreso') { sCol = '#483009'; sBg = '#fff9b9'; border = '#fbc02d'; }
              else if (statusStr === 'Atrasado') { sCol = '#541111'; sBg = '#fdb4bf'; border = '#ff2020'; }

              const developerName = getDeveloperNameForTask(item.taskId);

              return (
                <Box key={item.taskId} className="task-row" style={{ borderLeft: `6px solid ${border}` }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <span className="badge-base" style={{ backgroundColor: sBg, color: sCol }}>{statusStr}</span>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>{developerName}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <span className="badge-base" style={{ backgroundColor: pBg, color: pCol }}>{priorityName}</span>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
    <Footer />
    </>
  );
}

export default Dashboard;