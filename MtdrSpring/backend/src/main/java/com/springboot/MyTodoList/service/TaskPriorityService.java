package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskPriority;
import com.springboot.MyTodoList.repository.TaskPriorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskPriorityService {

    @Autowired
    private TaskPriorityRepository taskPriorityRepository;

    public TaskPriority saveTaskPriority(TaskPriority taskPriority) {
        return taskPriorityRepository.save(taskPriority);
    }

    public List<TaskPriority> getAllTaskPriorities() {
        return taskPriorityRepository.findAll();
    }

    public Optional<TaskPriority> getTaskPriorityById(Long id) {
        return taskPriorityRepository.findById(id);
    }

    public void deleteTaskPriority(Long id) {
        taskPriorityRepository.deleteById(id);
    }

    public TaskPriority updateTaskPriority(Long id, TaskPriority taskPriorityDetails) {
        Optional<TaskPriority> optionalTaskPriority = taskPriorityRepository.findById(id);
        if (optionalTaskPriority.isPresent()) {
            TaskPriority taskPriority = optionalTaskPriority.get();
            taskPriority.setPriorityName(taskPriorityDetails.getPriorityName());
            return taskPriorityRepository.save(taskPriority);
        }
        return null;
    }
}
