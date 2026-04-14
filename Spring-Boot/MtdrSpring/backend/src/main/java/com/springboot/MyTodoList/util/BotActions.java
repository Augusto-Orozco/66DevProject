package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.service.UserStoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    TaskService taskService;
    UserStoryService userStoryService;
    TaskUserService taskUserService;
    UserService userService;
    DeepSeekService deepSeekService;

    public BotActions(TelegramClient tc, TaskService ts, UserStoryService uss, TaskUserService tus, UserService us, DeepSeekService ds){
        telegramClient = tc;
        taskService = ts;
        userStoryService = uss;
        taskUserService = tus;
        userService = us;
        deepSeekService = ds;
        exit  = false;
    }

    public void setRequestText(String cmd){
        requestText=cmd;
    }

    public void setChatId(long chId){
        chatId=chId;
    }

    public void setTelegramClient(TelegramClient tc){
        telegramClient=tc;
    }

    public void setTaskService(TaskService tsvc){
        taskService = tsvc;
    }

    public TaskService getTaskService(){
        return taskService;
    }

    public void setUserStoryService(UserStoryService ussvc){
        userStoryService = ussvc;
    }

    public UserStoryService getUserStoryService(){
        return userStoryService;
    }

    public void setTaskUserService(TaskUserService tusvc){
        taskUserService = tusvc;
    }

    public TaskUserService getTaskUserService(){
        return taskUserService;
    }

    public void setUserService(UserService usvc){
        userService = usvc;
    }

    public UserService getUserService(){
        return userService;
    }

    public void setDeepSeekService(DeepSeekService dssvc){
        deepSeekService = dssvc;
    }

    public DeepSeekService getDeepSeekService(){
        return deepSeekService;
    }

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(),BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(),BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .build()
        );
        exit = true;
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
				|| requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit)
			BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        else
            return;
        exit = true;
    }

    public void fnListAll(){
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
				|| requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
				|| requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;

        try {
            User user = userService.getUserByTelegramId(chatId)
                .orElseThrow(() -> new Exception("No estás registrado en el sistema con el ID: " + chatId));

            List<TaskUser> taskUsers = taskUserService.getTasksByUser(user);
            List<Task> allTasks = taskUsers.stream().map(TaskUser::getTask).collect(Collectors.toList());

            if (allTasks.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No tienes tareas asignadas actualmente.", telegramClient);
            } else {
                ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .resizeKeyboard(true)
                    .oneTimeKeyboard(false)
                    .selective(true)
                    .build();

                List<KeyboardRow> keyboard = new ArrayList<>();
                keyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));
                keyboard.add(new KeyboardRow(BotLabels.ADD_NEW_ITEM.getLabel()));

                StringBuilder sb = new StringBuilder("📋 *Tus Tareas Asignadas:*\n\n");
                for (Task task : allTasks) {
                    sb.append("• ").append(task.getTitle()).append(" [").append(task.getStatus()).append("]\n");
                    keyboard.add(new KeyboardRow(task.getTitle()));
                }
                
                keyboardMarkup.setKeyboard(keyboard);
                BotHelper.sendMessageToTelegram(chatId, sb.toString(), telegramClient, keyboardMarkup);
            }
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ " + e.getMessage(), telegramClient);
            logger.error("Error en fnListAll: " + e.getMessage());
        }
        exit = true;
    }

    public void fnAddItem(){
        logger.info("Adding item");
		if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
				|| requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;
        logger.info("Adding item by BotHelper");
        String instruction = BotMessages.TYPE_NEW_TODO_ITEM.getMessage();
        BotHelper.sendMessageToTelegram(chatId, instruction, telegramClient);
        exit = true;
    }

    public void fnElse(){
        if(exit || !requestText.contains(":"))
            return;
        
        try {
            String[] mainParts = requestText.split(":");
            if (mainParts.length < 2) throw new Exception("Formato inválido. Usa ID_HISTORIA: Título");

            String storyId = mainParts[0].trim();
            String rest = mainParts[1].trim();
            
            String[] subParts = rest.split(",");
            
            String title = subParts[0].trim();
            String desc = (subParts.length > 1) ? subParts[1].trim() : "Sin descripción";
            String priority = (subParts.length > 2) ? subParts[2].trim() : "Media";
            Integer points = (subParts.length > 3) ? Integer.parseInt(subParts[3].trim()) : 1;
            Integer time = (subParts.length > 4) ? Integer.parseInt(subParts[4].trim()) : 1;

            UserStory story = userStoryService.getUserStoryById(storyId)
                .orElseThrow(() -> new Exception("La Historia de Usuario '" + storyId + "' no existe."));

            Task newTask = new Task(story, title, desc, "TODO", points, priority, time);
            taskService.saveTask(newTask);

            BotHelper.sendMessageToTelegram(chatId, "✅ Tarea '" + title + "' asignada a la historia " + storyId + " con éxito.", telegramClient);
        } catch (NumberFormatException e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ Error: Los puntos y el tiempo deben ser números.", telegramClient);
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ " + e.getMessage(), telegramClient);
            logger.error("Error al crear tarea: " + e.getMessage());
        }
        exit = true;
    }

    public void fnLLM(){
        logger.info("Calling LLM");
        if (!(requestText.contains(BotCommands.LLM_REQ.getCommand())) || exit)
            return;
        
        String prompt = "Dame los datos del clima en mty";
        String out = "<empty>";
        try{
            out = deepSeekService.generateText(prompt);
        }catch(Exception exc){
            logger.error("Error calling LLM: " + exc.getMessage());
        }

        BotHelper.sendMessageToTelegram(chatId, "LLM: "+out, telegramClient, null);
    }
}
