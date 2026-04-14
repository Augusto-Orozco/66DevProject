package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserService;
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
	private TaskUserService taskUserService;
	private UserService userService;
	
	private DeepSeekService deepSeekService;
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


	public ToDoItemBotController( BotProps bp, TaskService ts, UserStoryService uss, TaskUserService tus, UserService us, DeepSeekService ds) {
		this.botProps = bp;
		telegramClient = new OkHttpTelegramClient(getBotToken());
		this.taskService = ts;
		this.userStoryService = uss;
		this.taskUserService = tus;
		this.userService = us;
		this.deepSeekService = ds;
	}

	@Override
    public LongPollingUpdateConsumer getUpdatesConsumer() {
        return this;
    }

	@Override
	public void consume(Update update) {

		if (!update.hasMessage() || !update.getMessage().hasText()) return;

		

		String messageTextFromTelegram = update.getMessage().getText();
		long chatId = update.getMessage().getChatId();

		BotActions actions =  new BotActions(telegramClient, taskService, userStoryService, taskUserService, userService, deepSeekService);
		actions.setRequestText(messageTextFromTelegram);
		actions.setChatId(chatId);


		actions.fnStart();
		// actions.fnDone();
		// actions.fnUndo();
		// actions.fnDelete();
		actions.fnHide();
		actions.fnListAll();
		actions.fnAddItem();
		actions.fnLLM();
		actions.fnElse();

	}

	@AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        System.out.println("Registered bot running state is: " + botSession.isRunning());
    }

}


