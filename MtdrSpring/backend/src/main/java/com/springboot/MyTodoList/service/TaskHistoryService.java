package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TaskHistory;
import com.springboot.MyTodoList.repository.TaskHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskHistoryService {

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    public TaskHistory saveTaskHistory(TaskHistory taskHistory) {
        return taskHistoryRepository.save(taskHistory);
    }

    public List<TaskHistory> getAllTaskHistories() {
        return taskHistoryRepository.findAll();
    }

    public Optional<TaskHistory> getTaskHistoryById(Long id) {
        return taskHistoryRepository.findById(id);
    }

    public void deleteTaskHistory(Long id) {
        taskHistoryRepository.deleteById(id);
    }
}
