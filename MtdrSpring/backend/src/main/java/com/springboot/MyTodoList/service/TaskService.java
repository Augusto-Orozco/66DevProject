package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import com.springboot.MyTodoList.util.TaskDTO;
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
