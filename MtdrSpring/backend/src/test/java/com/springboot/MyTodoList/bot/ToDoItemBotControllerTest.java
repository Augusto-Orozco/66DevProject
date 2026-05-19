package com.springboot.MyTodoList.bot;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import com.springboot.MyTodoList.controller.ToDoItemBotController;
import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.SprintTaskService;
import com.springboot.MyTodoList.service.TaskPriorityService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskStatusService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.service.UserStoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.telegram.telegrambots.meta.api.objects.message.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;

class ToDoItemBotControllerTest {

    private ToDoItemBotController controller;
    private TelegramClient telegramClient;
    private UserService userService;
    // ... other services

    @BeforeEach
    void setUp() {
        BotProps botProps = mock(BotProps.class);
        when(botProps.getToken()).thenReturn("fake-token");
        TaskService taskService = mock(TaskService.class);
        UserStoryService userStoryService = mock(UserStoryService.class);
        DeepSeekService deepSeekService = mock(DeepSeekService.class);
        userService = mock(UserService.class);
        TaskUserService taskUserService = mock(TaskUserService.class);
        TaskStatusService taskStatusService = mock(TaskStatusService.class);
        TaskPriorityService taskPriorityService = mock(TaskPriorityService.class);
        SprintService sprintService = mock(SprintService.class);
        SprintTaskService sprintTaskService = mock(SprintTaskService.class);
        
        telegramClient = mock(TelegramClient.class);

        controller = new ToDoItemBotController(botProps, taskService, userStoryService, deepSeekService, 
                                              userService, taskUserService, taskStatusService, taskPriorityService, 
                                              sprintService, sprintTaskService);
        
        // Inject the mock telegramClient because it's manually instantiated in the constructor
        ReflectionTestUtils.setField(controller, "telegramClient", telegramClient);
    }

    @Test
    void testConsumeUpdate() throws Exception {
        // Arrange
        Update update = mock(Update.class);
        Message message = mock(Message.class);
        
        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/start");
        when(message.getChatId()).thenReturn(12345L);

        // Act
        controller.consume(update);

        // Assert
        // verify(telegramClient).execute(any(SendMessage.class)); 
        // Note: BotActions is created inside consume, and it calls fnStart, etc.
        // Since we mocked the services, we can expect it to try sending a message.
        verify(telegramClient).execute(any(SendMessage.class));
    }
}
