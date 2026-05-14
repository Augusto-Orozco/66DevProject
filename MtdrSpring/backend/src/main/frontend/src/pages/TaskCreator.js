import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, MenuItem, CircularProgress, Alert } from '@mui/material'
import Footer from '../components/Footer'
import '../Assets/styles.css'


function TaskCreator({ selectedProjectId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priorityId: '',
    statusId: '',
    userStoryId: '',
    storyPoints: 0,
    objetiveTime: 0,
    assignedUserIds: []
  })

  const [users, setUsers] = useState([])
  const [stories, setStories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchData = async () => {
      try {
        const [usersRes, storiesRes, prioritiesRes, statusesRes] = await Promise.all([
          fetch(`/team/project/${selectedProjectId}`).then(res => res.json()),
          fetch(`/userStories`).then(res => res.json()).catch(() => []), // Assuming this endpoint exists
          fetch(`/priorities`).then(res => res.json()).catch(() => []), // Assuming this endpoint exists
          fetch(`/statuses`).then(res => res.json()).catch(() => [])   // Assuming this endpoint exists
        ])

        setUsers(Array.isArray(usersRes) ? usersRes.map(tp => tp.user) : [])
        setStories(Array.isArray(storiesRes) ? storiesRes : [])
        setPriorities(Array.isArray(prioritiesRes) ? prioritiesRes : [])
        setStatuses(Array.isArray(statusesRes) ? statusesRes : [])
      } catch (err) {
        console.error("Error loading TaskCreator data:", err)
      }
    }

    fetchData()
  }, [selectedProjectId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setMessage({ type: 'error', text: 'No hay un proyecto seleccionado.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 1. Crear la Tarea
      const taskRes = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          project: { projectId: selectedProjectId },
          userStory: { userStoriesId: formData.userStoryId },
          priority: { priorityId: formData.priorityId },
          status: { statusId: formData.statusId },
          storyPoints: formData.storyPoints,
          objetiveTime: formData.objetiveTime,
          deleted: 'N'
        })
      })

      if (!taskRes.ok) throw new Error('Error al crear la tarea')
      const newTask = await taskRes.json()

      // 2. Asignar usuarios si los hay
      if (formData.assignedUserIds.length > 0) {
        // Por simplicidad, asumimos un endpoint o proceso para asignar
        // Aquí deberías llamar a tu endpoint de asignación de usuarios a tareas
        for (const userId of formData.assignedUserIds) {
          await fetch('/taskUsers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: { taskId: newTask.taskId, userId: userId },
              task: { taskId: newTask.taskId },
              user: { userId: userId }
            })
          })
        }
      }

      setMessage({ type: 'success', text: 'Tarea creada exitosamente.' })
      setFormData({
        title: '',
        description: '',
        priorityId: '',
        statusId: '',
        userStoryId: '',
        storyPoints: 0,
        objetiveTime: 0,
        assignedUserIds: []
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box className="task-creator-wrapper" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <Box className="base-card" sx={{ width: '100%', maxWidth: 600, p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">Crear Nueva Tarea</Typography>
          
          {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField label="Título" name="title" fullWidth margin="normal" value={formData.title} onChange={handleChange} required />
            <TextField label="Descripción" name="description" fullWidth margin="normal" multiline rows={3} value={formData.description} onChange={handleChange} required />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Story Points" name="storyPoints" type="number" fullWidth margin="normal" value={formData.storyPoints} onChange={handleChange} />
              <TextField label="Tiempo Objetivo (Horas)" name="objetiveTime" type="number" fullWidth margin="normal" value={formData.objetiveTime} onChange={handleChange} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Prioridad" name="priorityId" fullWidth margin="normal" value={formData.priorityId} onChange={handleChange} required>
                {priorities.map(p => <MenuItem key={p.priorityId} value={p.priorityId}>{p.priorityName}</MenuItem>)}
              </TextField>
              <TextField select label="Estado" name="statusId" fullWidth margin="normal" value={formData.statusId} onChange={handleChange} required>
                {statuses.map(s => <MenuItem key={s.statusId} value={s.statusId}>{s.status}</MenuItem>)}
              </TextField>
            </Box>

            <TextField select label="Historia de Usuario" name="userStoryId" fullWidth margin="normal" value={formData.userStoryId} onChange={handleChange} required>
              {stories.map(s => <MenuItem key={s.userStoriesId} value={s.userStoriesId}>{s.name}</MenuItem>)}
            </TextField>

            <TextField select label="Asignar a Desarrolladores" name="assignedUserIds" fullWidth margin="normal" SelectProps={{ multiple: true }} value={formData.assignedUserIds} onChange={handleChange}>
              {users.map(u => <MenuItem key={u.userId} value={u.userId}>{u.firtsName} {u.lastName}</MenuItem>)}
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Crear Tarea'}
            </Button>
          </form>
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default TaskCreator