package com.springboot.MyTodoList.bot;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.model.Role;
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
    void testStartCommandWithUnregisteredUser() throws Exception {
        // Arrange
        long chatId = 12345L;
        
        when(userService.getUserByTelegramId(chatId)).thenReturn(Optional.empty());

        botActions.setChatId(chatId);
        botActions.setRequestText("/start");

        // Act
        botActions.fnStart();

        // Assert
        verify(telegramClient).execute(any(SendMessage.class));
    }
}
