package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.SprintTaskService;
import com.springboot.MyTodoList.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private SprintTaskService sprintTaskService;

    @Autowired
    private SprintService sprintService;

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/sprints")
    public List<Sprint> getAllSprints() {
        return sprintService.getAllSprints();
    }

    @GetMapping("/userStory/{userStoryId}")
    public List<Task> getTasksByUserStoryId(@PathVariable String userStoryId) {
        return taskService.getTasksByUserStoryId(userStoryId);
    }

    @GetMapping("/sprintTasks/{sprintId}")
    public List<SprintTask> getSprintTasksBySprintId(@PathVariable Long sprintId) {
        return sprintTaskService.getSprintTasksBySprintId(sprintId);
    }
    
    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
