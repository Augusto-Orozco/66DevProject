package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.SprintTaskService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.TaskUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private SprintTaskService sprintTaskService;

    @Autowired
    private SprintService sprintService;

    @Autowired
    private TaskUserService taskUserService;

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/tasks/user/{userId}")
    public List<Task> getTasksByUserId(@PathVariable Long userId) {
        List<TaskUser> taskUsers = taskUserService.getTasksByUserId(userId);
        return taskUsers.stream()
                .map(TaskUser::getTask)
                .collect(Collectors.toList());
    }

    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @GetMapping("/userTasks/{id}")
    public ResponseEntity<Task> getTaskUserById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tasks/unassigned")
    public List<Task> getUnassignedTasks() {
        return taskService.getUnassignedTasks();
    }
    
    @GetMapping("/userStory/{userStoryId}")
    public List<Task> getTasksByUserStoryId(@PathVariable String userStoryId) {
        return taskService.getTasksByUserStoryId(userStoryId);
    }

    @PostMapping("/sprints")
    public Sprint createSprint(@RequestBody Sprint sprint) {
        return sprintService.saveSprint(sprint);
    }

    @GetMapping("/sprints")
    public List<Sprint> getAllSprints() {
        return sprintService.getAllSprints();
    }

    @GetMapping("/sprintTasks/{sprintId}")
    public List<SprintTask> getSprintTasksBySprintId(@PathVariable Long sprintId) {
        return sprintTaskService.getSprintTasksBySprintId(sprintId);
    }

    @PutMapping("/tasks/{taskId}/assign/{sprintId}")
    public ResponseEntity<Void> assignTaskToSprint(@PathVariable Long taskId, @PathVariable Long sprintId) {
        Optional<Task> taskOpt = taskService.getTaskById(taskId);
        Optional<Sprint> sprintOpt = sprintService.getSprintById(sprintId);

        if (taskOpt.isPresent() && sprintOpt.isPresent()) {
            sprintTaskService.assignTaskToSprint(taskOpt.get(), sprintOpt.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/tasks/{taskId}/unassign")
    public ResponseEntity<Void> unassignTaskFromSprint(@PathVariable Long taskId) {
        Optional<Task> taskOpt = taskService.getTaskById(taskId);
        if (taskOpt.isPresent()) {
            sprintTaskService.assignTaskToSprint(taskOpt.get(), null);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
