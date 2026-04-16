package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.SprintTask.SprintTaskId;
import com.springboot.MyTodoList.repository.SprintTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintTaskService {

    @Autowired
    private SprintTaskRepository sprintTaskRepository;

    public SprintTask saveSprintTask(SprintTask sprintTask) {
        return sprintTaskRepository.save(sprintTask);
    }

    public List<SprintTask> getAllSprintTasks() {
        return sprintTaskRepository.findAll();
    }

    public Optional<SprintTask> getSprintTaskById(SprintTaskId id) {
        return sprintTaskRepository.findById(id);
    }

    public void deleteSprintTask(SprintTaskId id) {
        sprintTaskRepository.deleteById(id);
    }
}
