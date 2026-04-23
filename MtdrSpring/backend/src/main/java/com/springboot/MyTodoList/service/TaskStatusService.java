package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.repository.TaskStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskStatusService {

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    public TaskStatus saveTaskStatus(TaskStatus taskStatus) {
        return taskStatusRepository.save(taskStatus);
    }

    public List<TaskStatus> getAllTaskStatuses() {
        return taskStatusRepository.findAll();
    }

    public Optional<TaskStatus> getTaskStatusById(Long id) {
        return taskStatusRepository.findById(id);
    }

    public void deleteTaskStatus(Long id) {
        taskStatusRepository.deleteById(id);
    }

    public TaskStatus updateTaskStatus(Long id, TaskStatus taskStatusDetails) {
        Optional<TaskStatus> optionalTaskStatus = taskStatusRepository.findById(id);
        if (optionalTaskStatus.isPresent()) {
            TaskStatus taskStatus = optionalTaskStatus.get();
            taskStatus.setStatus(taskStatusDetails.getStatus());
            return taskStatusRepository.save(taskStatus);
        }
        return null;
    }
}
