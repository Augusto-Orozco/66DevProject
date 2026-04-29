package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskStatus;
import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskStatusService;
import com.springboot.MyTodoList.service.TaskPriorityService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.service.UserStoryService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);
    private static final Map<Long, Long> pendingTaskHours = new HashMap<>();

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    TaskService taskService;
    UserStoryService userStoryService;
    DeepSeekService deepSeekService;
    TaskStatusService taskStatusService;
    TaskPriorityService taskPriorityService;
    UserService userService;
    TaskUserService taskUserService;

    public BotActions(TelegramClient tc, TaskService ts, UserStoryService uss, DeepSeekService ds, 
                      TaskStatusService tss, TaskPriorityService tps, UserService usvc, TaskUserService tusvc){
        telegramClient = tc;
        taskService = ts;
        userStoryService = uss;
        deepSeekService = ds;
        taskStatusService = tss;
        taskPriorityService = tps;
        userService = usvc;
        taskUserService = tusvc;
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

    public void setDeepSeekService(DeepSeekService dssvc){
        deepSeekService = dssvc;
    }

    public DeepSeekService getDeepSeekService(){
        return deepSeekService;
    }


    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        pendingTaskHours.remove(chatId);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  ReplyKeyboardMarkup
            .builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.ADVICE.getLabel()))
            .keyboardRow(new KeyboardRow(/*BotLabels.SHOW_MAIN_SCREEN.getLabel(),*/ BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .build()
        );
        exit = true;
    }

    public void fnAddItem(){
        if (!(requestText.equals(BotLabels.ADD_NEW_ITEM.getLabel())) || exit) 
            return;

        pendingTaskHours.remove(chatId);
        List<Task> allItems = taskService.getAllTasks();
        
        List<KeyboardRow> keyboard = new ArrayList<>();
        keyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));

        for (Task task : allItems) {
            // Estado 1: Pendiente
            if (task.getStatus() == null || task.getStatus().getStatusId() != 1L) continue;

            KeyboardRow row = new KeyboardRow();
            row.add(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + task.getTitle() + ": " + task.getDescription());
            keyboard.add(row);
        }

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .keyboard(keyboard)
            .build();

        BotHelper.sendMessageToTelegram(chatId, "Selecciona la tarea que deseas iniciar:", telegramClient, keyboardMarkup);
        exit = true;
    }

    public void fnActivatePendingTask() {
        if (exit || !requestText.contains(BotLabels.DASH.getLabel())) return;
        
        if (requestText.contains(BotLabels.DONE.getLabel()) || 
            requestText.contains(BotLabels.IN_PROGRESS.getLabel())) return;

        try {
            String idStr = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())).trim();
            Long id = Long.valueOf(idStr);

            taskService.getTaskById(id).ifPresent(task -> {
                // Estado 1: Pendiente
                if (task.getStatus() != null && task.getStatus().getStatusId() == 1L) {
                    // Cambiar a Estado 2: En Progreso
                    taskStatusService.getTaskStatusById(2L).ifPresent(task::setStatus);
                    task.setFinishedAt(null);
                    taskService.saveTask(task);
                    BotHelper.sendMessageToTelegram(chatId, "¡Tarea \"" + task.getTitle() + "\" iniciada correctamente!", telegramClient);
                    exit = true;
                }
            });
        } catch (Exception e) {
            // No es una selección válida o el ID no es numérico
        }
    }

    public void fnDone() {
        if (!(requestText.contains(BotLabels.DONE.getLabel())) || exit) 
            return;
            
        try {
            String doneStr = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())).trim();
            Long id = Long.valueOf(doneStr);

            taskService.getTaskById(id).ifPresent(task -> {
                pendingTaskHours.put(chatId, id);
                BotHelper.sendMessageToTelegram(chatId, "¿Cuántas horas tardaste en realizar la tarea \"" + task.getTitle() + "\"? (Número)", telegramClient);
            });

        } catch (Exception e) {
            logger.error("Error al iniciar completado: " + e.getLocalizedMessage());
        }
        exit = true;
    }

    public void fnRecordHours() {
        if (exit || !pendingTaskHours.containsKey(chatId)) 
            return;

        try {
            String hoursStr = requestText.trim();
            Integer hours = Integer.valueOf(hoursStr);
            Long taskId = pendingTaskHours.remove(chatId);

            taskService.getTaskById(taskId).ifPresent(task -> {
                // Cambiar a Estado 3: Completado
                taskStatusService.getTaskStatusById(3L).ifPresent(task::setStatus);
                task.setRealTime(hours);
                task.setFinishedAt(LocalDateTime.now());
                taskService.saveTask(task);
                BotHelper.sendMessageToTelegram(chatId, "¡Tarea \"" + task.getTitle() + "\" marcada como COMPLETADA en " + hours + " horas!", telegramClient);
            });
            exit = true;

        } catch (NumberFormatException e) {
            // No es un número
        } catch (Exception e) {
            logger.error("Error al registrar horas: " + e.getLocalizedMessage());
            pendingTaskHours.remove(chatId);
        }
    }

    public void fnUndo() {
        if (!(requestText.contains(BotLabels.IN_PROGRESS.getLabel())) || exit) 
            return;

        pendingTaskHours.remove(chatId);
        try {
            String idStr = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())).trim();
            Long id = Long.valueOf(idStr);

            taskService.getTaskById(id).ifPresent(task -> {
                // Cambiar a Estado 2: En Progreso
                taskStatusService.getTaskStatusById(2L).ifPresent(task::setStatus);
                task.setFinishedAt(null);
                taskService.saveTask(task);
                BotHelper.sendMessageToTelegram(chatId, "Tarea \"" + task.getTitle() + "\" marcada como EN PROGRESO.", telegramClient);
            });

        } catch (Exception e) {
            logger.error("Error al marcar en progreso: " + e.getLocalizedMessage());
        }
        exit = true;
    }

    public void fnDelete(){
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
				|| requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit) {
			BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
            pendingTaskHours.remove(chatId);
        } else
            return;
        exit = true;
    }

    public void fnListAll(){
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
				|| requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
				|| requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;

        pendingTaskHours.remove(chatId);
        List<Task> allItems = taskService.getAllTasks();
        
        List<KeyboardRow> keyboard = new ArrayList<>();

        // Botón volver
        keyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));

        // Solo mostrar tareas en progreso (Estado 2)
        for (Task task : allItems) {
            if (task.getStatus() == null || task.getStatus().getStatusId() != 2L) continue;

            KeyboardRow row = new KeyboardRow();
            row.add(task.getTitle());
            row.add(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + BotLabels.DONE.getLabel());
            row.add(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + BotLabels.IN_PROGRESS.getLabel());
            keyboard.add(row);
        }

        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .keyboard(keyboard)
            .build();

        BotHelper.sendMessageToTelegram(chatId, "📋 Tus tareas pendientes:", telegramClient, keyboardMarkup);
        exit = true;
    }

    public void fnElse(){
        if(exit)
            return;
        
        // Si no es un comando conocido, simplemente no hace nada o envía mensaje de ayuda
        BotHelper.sendMessageToTelegram(chatId, "Usa /todolist para ver tus tareas.", telegramClient);
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

        }

        BotHelper.sendMessageToTelegram(chatId, "LLM: "+out, telegramClient, null);

    }

    public void fnAdvice() {
        if (!(requestText.equals(BotLabels.ADVICE.getLabel())) || exit)
            return;

        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<TaskUser> userTasks = taskUserService.getTasksByUserId(user.getUserId());
            
            if (userTasks.isEmpty()) {
                BotHelper.sendMessageToTelegram(chatId, "No tienes tareas asignadas actualmente. ¡Es un buen momento para planificar algo nuevo!", telegramClient);
            } else {
                StringBuilder promptBuilder = new StringBuilder();
                promptBuilder.append("Hola, soy ").append(user.getFirtsName()).append(". ");
                promptBuilder.append("Estas son mis tareas actuales:\n");
                
                for (TaskUser tu : userTasks) {
                    Task t = tu.getTask();
                    promptBuilder.append("- ").append(t.getTitle())
                                 .append(" (Estado: ").append(t.getStatus() != null ? t.getStatus().getStatus() : "Pendiente")
                                 .append(", Prioridad: ").append(t.getPriority() != null ? t.getPriority().getPriorityName() : "Media")
                                 .append("): ").append(t.getDescription()).append("\n");
                }
                
                promptBuilder.append("\nBasado en mi progreso y estas tareas, ¿qué consejo me das para ser más productivo hoy? Sé breve y motivador.");

                try {
                    String advice = deepSeekService.generateText(promptBuilder.toString());
                    BotHelper.sendMessageToTelegram(chatId, "💡 *Consejo de IA:*\n\n" + advice, telegramClient);
                } catch (Exception e) {
                    logger.error("Error al obtener consejo de IA: " + e.getMessage());
                    BotHelper.sendMessageToTelegram(chatId, "Lo siento, no pude obtener un consejo en este momento. ¡Sigue adelante con tus tareas!", telegramClient);
                }
            }
        } else {
            BotHelper.sendMessageToTelegram(chatId, "No pude identificarte en el sistema. Por favor, asegúrate de estar registrado.", telegramClient);
        }
        
        exit = true;
    }


}
