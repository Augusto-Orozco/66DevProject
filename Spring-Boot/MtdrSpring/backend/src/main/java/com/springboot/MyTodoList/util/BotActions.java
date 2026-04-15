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

        try {
            User user = userService.getUserByTelegramId(chatId)
                .orElseThrow(() -> new Exception("No estás registrado en el sistema."));

            ReplyKeyboardMarkup keyboardMarkup;
            if (user.getRole().getRoleId() == 1L) { // Project Manager
                keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
                    .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                    .build();
                BotHelper.sendMessageToTelegram(chatId, "Bienvenido, Project Manager " + user.getFirtsName() + ". " + BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, keyboardMarkup);
            } else { // Developer or others
                keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel()))
                    .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                    .build();
                BotHelper.sendMessageToTelegram(chatId, "Hola, Desarrollador " + user.getFirtsName() + ". " + BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, keyboardMarkup);
            }
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ Error: " + e.getMessage(), telegramClient);
        }
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
                if (user.getRole().getRoleId() == 1L) {
                    keyboard.add(new KeyboardRow(BotLabels.ADD_NEW_ITEM.getLabel()));
                }

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
        logger.info("Adding item check");
		if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
				|| requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;

        try {
            User user = userService.getUserByTelegramId(chatId)
                .orElseThrow(() -> new Exception("No registrado."));
            
            if (user.getRole().getRoleId() != 1L) {
                BotHelper.sendMessageToTelegram(chatId, "⛔ Solo los Project Managers pueden crear tareas.", telegramClient);
                exit = true;
                return;
            }

            logger.info("Adding item by BotHelper");
            String instruction = BotMessages.TYPE_NEW_TODO_ITEM.getMessage();
            BotHelper.sendMessageToTelegram(chatId, instruction, telegramClient);
        } catch (Exception e) {
            BotHelper.sendMessageToTelegram(chatId, "❌ " + e.getMessage(), telegramClient);
        }
        exit = true;
    }

    public void fnElse(){
        if(exit) return;

        // Validar rol para creación de tareas
        try {
            User user = userService.getUserByTelegramId(chatId)
                .orElseThrow(() -> new Exception("No registrado."));
            
            if (user.getRole().getRoleId() != 1L && (requestText.contains(":") || requestText.startsWith("CREAR_Y_ASIGNAR:"))) {
                BotHelper.sendMessageToTelegram(chatId, "⛔ No tienes permisos para realizar esta acción.", telegramClient);
                exit = true;
                return;
            }
        } catch (Exception e) {
            // Si no está registrado y trata de usar ':' o comandos, ignorar o avisar
            if (requestText.contains(":") || requestText.startsWith("CREAR_Y_ASIGNAR:")) {
                BotHelper.sendMessageToTelegram(chatId, "❌ Debes estar registrado para realizar esta acción.", telegramClient);
                exit = true;
                return;
            }
        }

        // Caso 1: Se recibió el formato inicial STORY_ID: Title, Desc...
        if(requestText.contains(":")) {
            try {
                String[] mainParts = requestText.split(":");
                if (mainParts.length < 2) throw new Exception("Formato inválido. Usa ID_HISTORIA: Título, Descripción, Prioridad, Puntos, Tiempo");

                String storyId = mainParts[0].trim();
                String rest = mainParts[1].trim();
                String[] subParts = rest.split(",");
                
                String title = subParts[0].trim();
                String desc = (subParts.length > 1) ? subParts[1].trim() : "Sin descripción";
                String priority = (subParts.length > 2) ? subParts[2].trim() : "Media";
                Integer points = (subParts.length > 3) ? Integer.parseInt(subParts[3].trim()) : 1;
                Integer time = (subParts.length > 4) ? Integer.parseInt(subParts[4].trim()) : 1;

                // Validar que la historia existe
                userStoryService.getUserStoryById(storyId)
                    .orElseThrow(() -> new Exception("La Historia de Usuario '" + storyId + "' no existe."));

                // Obtener desarrolladores
                List<User> developers = userService.getDevelopers();
                if (developers.isEmpty()) {
                    throw new Exception("No hay desarrolladores registrados en el sistema.");
                }

                ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
                    .resizeKeyboard(true)
                    .oneTimeKeyboard(true)
                    .build();

                List<KeyboardRow> keyboard = new ArrayList<>();
                for (User dev : developers) {
                    // Formato del botón: [DEV_ID] -> STORY_ID:Title...
                    // Usamos un prefijo claro para atraparlo en el siguiente mensaje
                    String buttonLabel = String.format("👤 Asignar a ID %d: %s", dev.getUserId(), dev.getFirtsName());
                    // El comando oculto en el texto del botón (Telegram envía el texto del botón)
                    // Como no tenemos estado, concatenamos la info en el botón o usamos un mensaje especial.
                    // Intentemos un formato que fnElse pueda capturar:
                    // ASIGNAR:DEV_ID:STORY_ID:TITLE:DESC:PRIORITY:POINTS:TIME
                    String cmd = String.format("CREAR_Y_ASIGNAR:%d:%s:%s:%s:%s:%d:%d", 
                        dev.getUserId(), storyId, title, desc, priority, points, time);
                    
                    keyboard.add(new KeyboardRow(cmd));
                }
                keyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));
                keyboardMarkup.setKeyboard(keyboard);

                BotHelper.sendMessageToTelegram(chatId, "Selecciona al desarrollador para asignar la tarea:", telegramClient, keyboardMarkup);
                exit = true;
                return;
            } catch (Exception e) {
                if (!requestText.startsWith("CREAR_Y_ASIGNAR:")) {
                    BotHelper.sendMessageToTelegram(chatId, "❌ " + e.getMessage(), telegramClient);
                    logger.error("Error al procesar entrada: " + e.getMessage());
                    exit = true;
                    return;
                }
            }
        }

        // Caso 2: Se recibió el comando de creación desde el botón
        if (requestText.startsWith("CREAR_Y_ASIGNAR:")) {
            try {
                String[] parts = requestText.split(":");
                // parts[0] = "CREAR_Y_ASIGNAR"
                // parts[1] = devId
                // parts[2] = storyId
                // parts[3] = title
                // parts[4] = desc
                // parts[5] = priority
                // parts[6] = points
                // parts[7] = time

                Long devId = Long.parseLong(parts[1]);
                String storyId = parts[2];
                String title = parts[3];
                String desc = parts[4];
                String priority = parts[5];
                Integer points = Integer.parseInt(parts[6]);
                Integer time = Integer.parseInt(parts[7]);

                taskService.createTaskAndAssign(storyId, title, desc, "TODO", points, priority, time, devId);

                BotHelper.sendMessageToTelegram(chatId, "✅ Tarea '" + title + "' creada y asignada correctamente.", telegramClient);
            } catch (Exception e) {
                BotHelper.sendMessageToTelegram(chatId, "❌ Error al ejecutar procedimiento: " + e.getMessage(), telegramClient);
                logger.error("Error en fnElse (procedimiento): " + e.getMessage());
            }
            exit = true;
        }
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
