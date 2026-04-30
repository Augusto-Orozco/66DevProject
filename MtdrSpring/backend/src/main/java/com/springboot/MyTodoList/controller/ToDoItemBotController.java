package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.UserStoryService;
import com.springboot.MyTodoList.util.BotActions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController  implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {

	private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
	private TaskService taskService;
	private UserStoryService userStoryService;
	private DeepSeekService deepSeekService;
	private com.springboot.MyTodoList.service.UserService userService;
	private com.springboot.MyTodoList.service.TaskUserService taskUserService;
	private com.springboot.MyTodoList.service.TaskStatusService taskStatusService;
	private com.springboot.MyTodoList.service.TaskPriorityService taskPriorityService;
	private com.springboot.MyTodoList.service.SprintService sprintService;
	private com.springboot.MyTodoList.service.SprintTaskService sprintTaskService;
	private final TelegramClient telegramClient;
	
	private final BotProps botProps;

	@Value("${telegram.bot.token}")
	private String telegramBotToken;


	@Override
    public String getBotToken() {
		if(telegramBotToken != null && !telegramBotToken.trim().isEmpty()){
        	return telegramBotToken;
		}else{
			return botProps.getToken();
		}
    }


	public ToDoItemBotController( BotProps bp, TaskService tsvc, UserStoryService usvc, DeepSeekService ds, 
								  com.springboot.MyTodoList.service.UserService usvc2,
								  com.springboot.MyTodoList.service.TaskUserService tusvc,
								  com.springboot.MyTodoList.service.TaskStatusService tss, 
								  com.springboot.MyTodoList.service.TaskPriorityService tps,
								  com.springboot.MyTodoList.service.SprintService ssvc,
								  com.springboot.MyTodoList.service.SprintTaskService stsvc) {
		this.botProps = bp;
		telegramClient = new OkHttpTelegramClient(getBotToken());
		this.taskService = tsvc;
		this.userStoryService = usvc;
		this.deepSeekService = ds;
		this.userService = usvc2;
		this.taskUserService = tusvc;
		this.taskStatusService = tss;
		this.taskPriorityService = tps;
		this.sprintService = ssvc;
		this.sprintTaskService = stsvc;
	}

	@Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

	@Override
	public void consume(Update update) {

		String messageTextFromTelegram = "";
		long chatId = 0;

		if (update.hasMessage() && update.getMessage().hasText()) {
			messageTextFromTelegram = update.getMessage().getText();
			chatId = update.getMessage().getChatId();
		} else if (update.hasCallbackQuery()) {
			messageTextFromTelegram = update.getCallbackQuery().getData();
			chatId = update.getCallbackQuery().getMessage().getChatId();
		} else {
			return;
		}

		BotActions actions =  new BotActions(telegramClient, taskService, userStoryService, deepSeekService, userService, taskUserService, taskStatusService, taskPriorityService, sprintService, sprintTaskService);
		actions.setRequestText(messageTextFromTelegram);
		actions.setChatId(chatId);


		actions.fnStart();
		actions.fnHandleCreation();
		actions.fnCreateTask();
		actions.fnRecordHours();
		actions.fnActivatePendingTask();
		actions.fnDone();
		actions.fnUndo();
		actions.fnDelete();
		actions.fnHide();
		actions.fnListAll();
		actions.fnAddItem();
		actions.fnAIProgress();
		actions.fnLLM();
		actions.fnElse();

	}

	@AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }

}
