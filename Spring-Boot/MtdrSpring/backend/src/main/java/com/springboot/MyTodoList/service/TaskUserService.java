package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.TaskUser.TaskUserId;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.TaskUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskUserService {

    @Autowired
    private TaskUserRepository taskUserRepository;

    public TaskUser saveTaskUser(TaskUser taskUser) {
        return taskUserRepository.save(taskUser);
    }

    public List<TaskUser> getAllTaskUsers() {
        return taskUserRepository.findAll();
    }

    public List<TaskUser> getTasksByUser(User user) {
        return taskUserRepository.findByUser(user);
    }

    public Optional<TaskUser> getTaskUserById(TaskUserId id) {
        return taskUserRepository.findById(id);
    }

    public void deleteTaskUser(TaskUserId id) {
        taskUserRepository.deleteById(id);
    }
}
