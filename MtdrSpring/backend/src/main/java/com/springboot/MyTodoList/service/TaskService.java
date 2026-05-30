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
    private SprintTaskService sprintTaskService;

    @Autowired
    private TaskUserService taskUserService;

    @Autowired
    private SprintService sprintService;

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
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProject_ProjectId(projectId);
    }

    public List<Task> getUnassignedTasksByProjectId(Long projectId) {
        return taskRepository.findUnassignedTasksByProject(projectId);
    }

    public List<Task> getUnassignedTasks() {
        return taskRepository.findUnassignedTasks();
    }

    public List<Task> getTasksByUserStoryId(String userStoryId) {
        return taskRepository.findByUserStory_UserStoriesId(userStoryId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
