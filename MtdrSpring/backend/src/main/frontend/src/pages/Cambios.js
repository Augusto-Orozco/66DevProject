import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import Footer from '../components/Footer';
import '../Assets/styles.css';

const Cambios = ({ selectedProjectId }) => {
  const [loading, setLoading] = useState(true);
  const [taskHistory, setTaskHistory] = useState([]);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      
      // Fetch de historial de cambios
      const historyRes = await fetch(`/tasks/history/project/${selectedProjectId}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setTaskHistory(Array.isArray(historyData) ? historyData : []);
      }

    } catch (error) {
      console.error("Error fetching history data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Historial de Cambios
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '12px', 
          overflow: 'hidden',
          backgroundColor: 'white',
        }}>
          <Box sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', backgroundColor: '#fafafa', borderBottom: '1px solid #eee', py: 1, px: 2 }}>
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
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default Cambios;
