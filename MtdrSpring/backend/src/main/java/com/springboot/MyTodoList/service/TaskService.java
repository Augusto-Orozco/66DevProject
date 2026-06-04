package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import com.springboot.MyTodoList.repository.TaskPriorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import com.springboot.MyTodoList.util.TaskDTO;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.TaskStatusRepository;
import com.springboot.MyTodoList.repository.TaskHistoryRepository;
import com.springboot.MyTodoList.repository.UserRepository;
import com.springboot.MyTodoList.model.TaskHistory;
import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Types;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private TaskPriorityRepository taskPriorityRepository;

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SprintTaskService sprintTaskService;

    @Autowired
    private TaskUserService taskUserService;

    @Autowired
    private SprintService sprintService;

    @Transactional
    public void updateTaskStatusWithHistory(Long taskId, String statusName, Long userId, String changes) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        TaskStatus status = taskStatusRepository.findByStatusIgnoreCase(statusName)
                .orElseThrow(() -> new RuntimeException("Status not found: " + statusName));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        task.setStatus(status);
        if ("Completado".equalsIgnoreCase(statusName)) {
            task.setFinishedAt(java.time.LocalDateTime.now());
        } else {
            task.setFinishedAt(null);
        }
        taskRepository.save(task);

        TaskHistory history = new TaskHistory(task, user, changes);
        taskHistoryRepository.save(history);
    }

    public void populateResolutionNote(Task task) {
        if (task.getStatus() != null && "Completado".equalsIgnoreCase(task.getStatus().getStatus())) {
            taskHistoryRepository.findFirstByTask_TaskIdOrderByChangedAtDesc(task.getTaskId())
                    .ifPresent(history -> task.setResolutionNote(history.getChanges()));
        }
    }

    public void populateResolutionNotes(List<Task> tasks) {
        tasks.forEach(this::populateResolutionNote);
    }

    @Transactional
    public Long createTaskAtomic(TaskDTO taskDto) {
        return jdbcTemplate.execute(
            "{call CREATE_TASK_ATOMIC(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}",
            (CallableStatementCallback<Long>) cs -> {
                cs.setString(1, taskDto.getTitle());
                cs.setString(2, taskDto.getDescription());
                cs.setLong(3, taskDto.getProjectId());
                cs.setString(4, taskDto.getUserStoryId());
                cs.setLong(5, taskDto.getPriorityId());
                cs.setInt(6, taskDto.getStoryPoints());
                cs.setInt(7, taskDto.getObjectiveTime()); 
                
                if (taskDto.getSprintId() != null) cs.setLong(8, taskDto.getSprintId());
                else cs.setNull(8, Types.NUMERIC);
                
                if (taskDto.getAssignedUserId() != null) cs.setLong(9, taskDto.getAssignedUserId());
                else cs.setNull(9, Types.NUMERIC);
                
                cs.registerOutParameter(10, Types.NUMERIC);
                cs.execute();
                return cs.getLong(10);
            }
        );
    }

    @Transactional
    public void updateTaskAtomic(TaskDTO taskDto) {
        Task task = taskRepository.findById(taskDto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStoryPoints(taskDto.getStoryPoints());
        task.setObjetiveTime(taskDto.getObjectiveTime());

        if (taskDto.getProjectId() != null) {
            task.setProject(projectRepository.findById(taskDto.getProjectId()).orElse(null));
        }
        if (taskDto.getUserStoryId() != null) {
            task.setUserStory(userStoryRepository.findById(taskDto.getUserStoryId()).orElse(null));
        }
        if (taskDto.getPriorityId() != null) {
            task.setPriority(taskPriorityRepository.findById(taskDto.getPriorityId()).orElse(null));
        }

        taskRepository.save(task);

        // Update Sprint Assignment
        if (taskDto.getSprintId() != null) {
            sprintService.getSprintById(taskDto.getSprintId()).ifPresent(sprint -> {
                sprintTaskService.assignTaskToSprint(task, sprint);
            });
        } else {
            sprintTaskService.assignTaskToSprint(task, null);
        }

        // Update User Assignment
        taskUserService.assignTaskToUser(task.getTaskId(), taskDto.getAssignedUserId());
    }

    public Task saveTask(Task task) {
        Task savedTask = taskRepository.save(task);
        populateResolutionNote(savedTask);
        return savedTask;
    }

    public List<Task> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        populateResolutionNotes(tasks);
        return tasks;
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        List<Task> tasks = taskRepository.findByProject_ProjectId(projectId);
        populateResolutionNotes(tasks);
        return tasks;
    }

    public List<Task> getUnassignedTasksByProjectId(Long projectId) {
        List<Task> tasks = taskRepository.findUnassignedTasksByProject(projectId);
        populateResolutionNotes(tasks);
        return tasks;
    }

    public List<Task> getUnassignedTasks() {
        List<Task> tasks = taskRepository.findUnassignedTasks();
        populateResolutionNotes(tasks);
        return tasks;
    }

    public List<Task> getTasksByUserStoryId(String userStoryId) {
        List<Task> tasks = taskRepository.findByUserStory_UserStoriesId(userStoryId);
        populateResolutionNotes(tasks);
        return tasks;
    }

    public Optional<Task> getTaskById(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        task.ifPresent(this::populateResolutionNote);
        return task;
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
