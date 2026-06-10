package com.springboot.MyTodoList.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.model.TaskHistory;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TaskStatusRepository;
import com.springboot.MyTodoList.repository.UserRepository;
import com.springboot.MyTodoList.repository.TaskHistoryRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import com.springboot.MyTodoList.repository.TaskPriorityRepository;
import com.springboot.MyTodoList.util.TaskDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskStatusRepository taskStatusRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TaskHistoryRepository taskHistoryRepository;
    @Mock
    private JdbcTemplate jdbcTemplate;
    @Mock
    private SprintTaskService sprintTaskService;
    @Mock
    private TaskUserService taskUserService;
    @Mock
    private SprintService sprintService;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserStoryRepository userStoryRepository;
    @Mock
    private TaskPriorityRepository taskPriorityRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void testUpdateTaskStatusWithHistory() {
        // Arrange
        Long taskId = 1L;
        Long userId = 2L;
        String statusName = "Completado";
        
        Task task = new Task();
        task.setTaskId(taskId);
        
        TaskStatus status = new TaskStatus();
        status.setStatus(statusName);
        
        User user = new User();
        user.setUserId(userId);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskStatusRepository.findByStatusIgnoreCase(statusName)).thenReturn(Optional.of(status));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        taskService.updateTaskStatusWithHistory(taskId, statusName, userId, "Test Changes", 5);

        // Assert
        verify(taskRepository).save(task);
        verify(taskHistoryRepository).save(any(TaskHistory.class));
        assertEquals(status, task.getStatus());
        assertEquals(5, task.getRealTime());
    }

    @Test
    void testDeleteTask() {
        // Arrange
        Long taskId = 1L;
        Long userId = 2L;
        Task task = new Task();
        task.setTaskId(taskId);
        task.setTitle("Delete Me");

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));

        // Act
        taskService.deleteTask(taskId, userId);

        // Assert
        assertEquals("Y", task.getDeleted());
        assertEquals(userId, task.getDeletedBy());
        verify(taskRepository).save(task);
        verify(taskHistoryRepository).save(any(TaskHistory.class));
        verify(jdbcTemplate, times(2)).update(anyString(), eq(taskId));
    }

    @Test
    void testUpdateTaskAtomic() {
        // Arrange
        TaskDTO dto = new TaskDTO();
        dto.setTaskId(1L);
        dto.setTitle("Updated Title");
        dto.setDescription("Updated Desc");
        dto.setStoryPoints(8);

        Task task = new Task();
        task.setTaskId(1L);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        // Act
        taskService.updateTaskAtomic(dto);

        // Assert
        assertEquals("Updated Title", task.getTitle());
        assertEquals("Updated Desc", task.getDescription());
        assertEquals(8, task.getStoryPoints());
        verify(taskRepository).save(task);
    }
}
