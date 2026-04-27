package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.SprintTask.SprintTaskId;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.SprintTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SprintTaskService {

    @Autowired
    private SprintTaskRepository sprintTaskRepository;

    public List<SprintTask> getAllSprintTasks() {
        return sprintTaskRepository.findAll();
    }

    public List<SprintTask> getSprintTasksBySprintId(Long sprintId) {
        return sprintTaskRepository.findById_SprintId(sprintId);
    }

    @Transactional
    public void assignTaskToSprint(Task task, Sprint sprint) {
        sprintTaskRepository.deleteById_TaskId(task.getTaskId());
        
        if (sprint != null) {
            SprintTask sprintTask = new SprintTask(sprint, task, "N");
            sprintTaskRepository.save(sprintTask);
        }
    }

    public SprintTask saveSprintTask(SprintTask sprintTask) {
        return sprintTaskRepository.save(sprintTask);
    }

    public void deleteSprintTask(SprintTaskId id) {
        sprintTaskRepository.deleteById(id);
    }
}
