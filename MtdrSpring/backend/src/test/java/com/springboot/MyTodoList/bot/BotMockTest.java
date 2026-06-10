package com.springboot.MyTodoList.bot;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.model.Role;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.model.TaskPriority;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.SprintTaskService;
import com.springboot.MyTodoList.service.TaskPriorityService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskStatusService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.service.UserStoryService;
import com.springboot.MyTodoList.util.BotActions;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.TaskDTO;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.generics.TelegramClient;

class BotMockTest {

    private TelegramClient telegramClient;
    private TaskService taskService;
    private UserStoryService userStoryService;
    private DeepSeekService deepSeekService;
    private UserService userService;
    private TaskUserService taskUserService;
    private TaskStatusService taskStatusService;
    private TaskPriorityService taskPriorityService;
    private SprintService sprintService;
    private SprintTaskService sprintTaskService;
    private BotActions botActions;

    @BeforeEach
    void setUp() {
        telegramClient = mock(TelegramClient.class);
        taskService = mock(TaskService.class);
        userStoryService = mock(UserStoryService.class);
        deepSeekService = mock(DeepSeekService.class);
        userService = mock(UserService.class);
        taskUserService = mock(TaskUserService.class);
        taskStatusService = mock(TaskStatusService.class);
        taskPriorityService = mock(TaskPriorityService.class);
        sprintService = mock(SprintService.class);
        sprintTaskService = mock(SprintTaskService.class);

        botActions = new BotActions(telegramClient, taskService, userStoryService, deepSeekService, 
                                   userService, taskUserService, taskStatusService, taskPriorityService, 
                                   sprintService, sprintTaskService);
    }

    @Test
    void testStartCommandWithRegisteredUser() throws Exception {
        // Arrange
        long chatId = 12345L;
        User user = new User();
        user.setFirtsName("Test User");
        Role role = new Role();
        role.setRoleId(1L);
        user.setRole(role);
        
        when(userService.getUserByTelegramId(chatId)).thenReturn(Optional.of(user));

        botActions.setChatId(chatId);
        botActions.setRequestText("/start");

        // Act
        botActions.fnStart();

        // Assert
        verify(telegramClient).execute(any(SendMessage.class));
    }

    @Test
    void testCreateTaskFlow() throws Exception {
        // Arrange
        long chatId = 12345L;
        User user = new User();
        user.setUserId(1L);
        Role role = new Role();
        role.setRoleId(1L); // Admin can create tasks
        user.setRole(role);
        
        when(userService.getUserByTelegramId(chatId)).thenReturn(Optional.of(user));
        when(userStoryService.getAllUserStories()).thenReturn(Collections.singletonList(new UserStory("US-1", "Story 1", "Description 1")));
        when(taskPriorityService.getAllTaskPriorities()).thenReturn(Collections.singletonList(new TaskPriority(1L, "Alta")));
        
        Sprint sprint = new Sprint();
        sprint.setSprintId(1L);
        sprint.setSprintNum(1);
        Project project = new Project();
        project.setProjectId(1L);
        sprint.setProject(project);
        when(sprintService.getAllSprints()).thenReturn(Collections.singletonList(sprint));
        when(sprintService.getSprintById(1L)).thenReturn(Optional.of(sprint));
        when(userService.getAllUsers()).thenReturn(Collections.singletonList(user));
        when(taskService.createTaskAtomic(any(TaskDTO.class))).thenReturn(100L);

        botActions.setChatId(chatId);

        // Act - Start Creation
        botActions.setRequestText(BotLabels.CREATE_TASK.getLabel());
        botActions.fnCreateTask();
        
        // Act - Provide Title
        botActions.setRequestText("New Task Title");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Provide Description
        botActions.setRequestText("Task Description");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Select User Story
        botActions.setRequestText("US-1 - Story 1");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Select Priority
        botActions.setRequestText("1 - Alta");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Provide Story Points
        botActions.setRequestText("5");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Select Sprint
        botActions.setRequestText("1 - Sprint 1");
        resetExit();
        botActions.fnHandleCreation();
        
        // Act - Assign User
        botActions.setRequestText("1 - Test User");
        resetExit();
        botActions.fnHandleCreation();

        // Assert
        verify(taskService).createTaskAtomic(any(TaskDTO.class));
        verify(telegramClient, atLeastOnce()).execute(any(SendMessage.class));
    }

    @Test
    void testTaskStatusUpdateToDone() throws Exception {
        // Arrange
        long chatId = 12345L;
        long taskId = 100L;
        Task task = new Task();
        task.setTaskId(taskId);
        task.setTitle("Test Task");

        TaskStatus statusDone = new TaskStatus();
        statusDone.setStatusId(3L);
        statusDone.setStatus("Completado");

        when(taskService.getTaskById(taskId)).thenReturn(Optional.of(task));
        when(taskStatusService.getTaskStatusById(3L)).thenReturn(Optional.of(statusDone));

        botActions.setChatId(chatId);

        // Act - Initiate Done
        botActions.setRequestText(taskId + " " + BotLabels.DASH.getLabel() + " " + BotLabels.DONE.getLabel());
        resetExit();
        botActions.fnDone();

        // Act - Record Hours
        botActions.setRequestText("4");
        resetExit();
        botActions.fnRecordHours();

        // Assert
        verify(taskService).saveTask(any(Task.class));
        verify(telegramClient, atLeastOnce()).execute(any(SendMessage.class));
    }

    @Test
    void testAIProgressReport() throws Exception {
        // Arrange
        long chatId = 12345L;
        User user = new User();
        user.setUserId(1L);
        user.setFirtsName("Test");
        
        Task task = new Task();
        task.setTitle("Test Task");
        com.springboot.MyTodoList.model.TaskUser tu = new com.springboot.MyTodoList.model.TaskUser();
        tu.setTask(task);
        
        when(userService.getUserByTelegramId(chatId)).thenReturn(Optional.of(user));
        when(taskUserService.getTasksByUserId(1L)).thenReturn(Collections.singletonList(tu));
        when(deepSeekService.generateText(anyString())).thenReturn("AI Motivation Text");

        botActions.setChatId(chatId);
        botActions.setRequestText(BotLabels.AI_PROGRESS.getLabel());

        // Act
        botActions.fnAIProgress();

        // Assert
        verify(deepSeekService).generateText(anyString());
        verify(telegramClient, atLeastOnce()).execute(any(SendMessage.class));
    }

    private void resetExit() {
        try {
            java.lang.reflect.Field exitField = BotActions.class.getDeclaredField("exit");
            exitField.setAccessible(true);
            exitField.set(botActions, false);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
