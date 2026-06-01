package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.TaskUser.TaskUserId;
import com.springboot.MyTodoList.repository.TaskUserRepository;
import com.springboot.MyTodoList.repository.UserRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskUserService {

    @Autowired
    private TaskUserRepository taskUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    public TaskUser saveTaskUser(TaskUser taskUser) {
        return taskUserRepository.save(taskUser);
    }

    public List<TaskUser> getAllTaskUsers() {
        return taskUserRepository.findAll();
    }

    public List<TaskUser> getTaskUsersByProjectId(Long projectId) {
        return taskUserRepository.findByProjectId(projectId);
    }

    public List<TaskUser> getTasksByUserId(Long userId) {
        return taskUserRepository.findByIdUserId(userId);
    }

    public void deleteTaskUser(TaskUserId id) {
        taskUserRepository.deleteById(id);
    }

    @Transactional
    public void assignTaskToUser(Long taskId, Long userId) {
        // First, remove existing assignments for this task
        List<TaskUser> existingAssignments = taskUserRepository.findAll().stream()
                .filter(tu -> tu.getTask().getTaskId().equals(taskId))
                .collect(java.util.stream.Collectors.toList());
        taskUserRepository.deleteAll(existingAssignments);

        if (userId != null) {
            taskRepository.findById(taskId).ifPresent(task -> {
                userRepository.findById(userId).ifPresent(user -> {
                    TaskUser taskUser = new TaskUser(task, user);
                    taskUserRepository.save(taskUser);
                });
            });
        }
    }
}
