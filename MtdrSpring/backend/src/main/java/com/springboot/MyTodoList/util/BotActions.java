package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.TaskStatusService;
import com.springboot.MyTodoList.service.TaskPriorityService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.service.TaskUserService;
import com.springboot.MyTodoList.service.UserStoryService;
import com.springboot.MyTodoList.service.SprintService;
import com.springboot.MyTodoList.service.SprintTaskService;
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
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardRow;
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
    UserService userService;
    TaskUserService taskUserService;
    TaskStatusService taskStatusService;
    TaskPriorityService taskPriorityService;
    SprintService sprintService;
    SprintTaskService sprintTaskService;

    public enum CreationState {
        IDLE, WAITING_TITLE, WAITING_DESCRIPTION, WAITING_USER_STORY, WAITING_PRIORITY, WAITING_STORY_POINTS, WAITING_SPRINT, WAITING_ASSIGNMENT
    }

    public static class TaskCreationContext {
        String title;
        String description;
        String userStoryId;
        Long priorityId;
        Integer storyPoints;
        Long sprintId;
        Long assignedUserId;
        CreationState state = CreationState.IDLE;
    }

    private static final Map<Long, TaskCreationContext> creationContexts = new HashMap<>();

    public BotActions(TelegramClient tc, TaskService ts, UserStoryService uss, DeepSeekService ds, 
                      UserService usvc, TaskUserService tusvc, TaskStatusService tss, TaskPriorityService tps,
                      SprintService ssvc, SprintTaskService stsvc){
        telegramClient = tc;
        taskService = ts;
        userStoryService = uss;
        deepSeekService = ds;
        userService = usvc;
        taskUserService = tusvc;
        taskStatusService = tss;
        taskPriorityService = tps;
        sprintService = ssvc;
        sprintTaskService = stsvc;
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
        creationContexts.remove(chatId);
        
        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            //BotHelper.sendMessageToTelegram(chatId, "¡Hola, " + user.getFirtsName() + "! (Tu ID de Telegram es: `" + chatId + "`)", telegramClient);
            
            ReplyKeyboardMarkup.ReplyKeyboardMarkupBuilder keyboardBuilder = ReplyKeyboardMarkup.builder()
                .resizeKeyboard(true);
            
            keyboardBuilder.keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()));
            
            Long roleId = user.getRole().getRoleId();
            // Solo roles 1 (Admin/PM) y 3 pueden crear tareas. El rol 2 (Developer) NO puede.
            if (roleId == 1L || roleId == 3L) {
                keyboardBuilder.keyboardRow(new KeyboardRow(BotLabels.CREATE_TASK.getLabel()));
            }
            
            keyboardBuilder.keyboardRow(new KeyboardRow(BotLabels.AI_PROGRESS.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()));
            BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,  keyboardBuilder.build());
        } else {
            // Usuario no registrado
            String welcomeMsg = "👋 ¡Bienvenido! No hemos encontrado tu usuario en nuestra base de datos.\n\n" +
                                "Tu ID de Telegram es: `" + chatId + "`\n\n" +
                                "Por favor, proporciona este ID a tu administrador para que te vincule al sistema y puedas gestionar tus tareas.";
            BotHelper.sendMessageToTelegram(chatId, welcomeMsg, telegramClient);
        }
        
        exit = true;
    }

    public void fnAddItem(){
        if (!(requestText.equals(BotLabels.ADD_NEW_ITEM.getLabel())) || exit) 
            return;

        pendingTaskHours.remove(chatId);
        creationContexts.remove(chatId);
        
        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        if (userOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No estás vinculado a ningún usuario.", telegramClient);
            exit = true;
            return;
        }

        List<TaskUser> assignedTasks = taskUserService.getTasksByUserId(userOpt.get().getUserId());
        
        InlineKeyboardMarkup.InlineKeyboardMarkupBuilder inlineKeyboard = InlineKeyboardMarkup.builder();

        boolean hasPending = false;
        for (TaskUser tu : assignedTasks) {
            Task task = tu.getTask();
            // Estado 1: Pendiente
            if (task.getStatus() == null || task.getStatus().getStatusId() != 1L) continue;

            hasPending = true;
            inlineKeyboard.keyboardRow(new InlineKeyboardRow(
                InlineKeyboardButton.builder()
                    .text(task.getTitle())
                    .callbackData(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + task.getTitle())
                    .build()
            ));
        }

        if (!hasPending) {
            BotHelper.sendMessageToTelegram(chatId, "No tienes tareas pendientes para iniciar.", telegramClient);
            exit = false;
            fnStart();
        } else {
            BotHelper.sendMessageToTelegram(chatId, "Selecciona una de tus tareas para iniciar:", telegramClient, inlineKeyboard.build());
        }
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
                    exit = false;
                    fnStart();
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
            exit = false;
            fnStart();
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
            exit = false;
            fnStart();
            exit = true;

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
            creationContexts.remove(chatId);
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
        creationContexts.remove(chatId);
        
        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        if (userOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No encontré un usuario vinculado a tu Telegram ID.", telegramClient);
            exit = true;
            return;
        }

        List<TaskUser> assignedTasks = taskUserService.getTasksByUserId(userOpt.get().getUserId());
        
        if (assignedTasks.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No tienes tareas asignadas.", telegramClient);
            exit = true;
            return;
        }

        BotHelper.sendMessageToTelegram(chatId, "Tus tareas asignadas:", telegramClient);

        for (TaskUser tu : assignedTasks) {
            Task task = tu.getTask();
            InlineKeyboardMarkup inlineKeyboard;

            // Estado 3: Completada
            if (task.getStatus() != null && task.getStatus().getStatusId() == 3L) {
                inlineKeyboard = InlineKeyboardMarkup.builder()
                    .keyboardRow(new InlineKeyboardRow(
                        InlineKeyboardButton.builder()
                            .text("Tarea Finalizada")
                            .callbackData("ignore")
                            .build()
                    ))
                    .build();
            } else {
                inlineKeyboard = InlineKeyboardMarkup.builder()
                    .keyboardRow(new InlineKeyboardRow(
                        InlineKeyboardButton.builder()
                            .text("Completada")
                            .callbackData(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + BotLabels.DONE.getLabel())
                            .build(),
                        InlineKeyboardButton.builder()
                            .text("En Progreso")
                            .callbackData(task.getTaskId() + " " + BotLabels.DASH.getLabel() + " " + BotLabels.IN_PROGRESS.getLabel())
                            .build()
                    ))
                    .build();
            }

            BotHelper.sendMessageToTelegram(chatId, task.getTitle(), telegramClient, inlineKeyboard);
        }
        exit = false;
        fnStart();
        exit = true;
    }

    public void fnCreateTask() {
        if (!(requestText.equals(BotCommands.CREATE_TASK.getCommand()) || 
              requestText.equals(BotLabels.CREATE_TASK.getLabel())) || exit)
            return;

        pendingTaskHours.remove(chatId);
        
        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        if (userOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No encontré un usuario vinculado a tu Telegram ID.", telegramClient);
            exit = true;
            return;
        }

        User user = userOpt.get();
        Long roleId = user.getRole().getRoleId();
        if (roleId != 1L && roleId != 2L && roleId != 3L) {
            BotHelper.sendMessageToTelegram(chatId, "No tienes permisos para crear tareas.", telegramClient);
            exit = true;
            return;
        }

        TaskCreationContext context = new TaskCreationContext();
        context.state = CreationState.WAITING_TITLE;
        creationContexts.put(chatId, context);

        BotHelper.sendMessageToTelegram(chatId, "Ingresa el TÍTULO de la nueva tarea:", telegramClient, 
            ReplyKeyboardMarkup.builder().keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel())).build());
        exit = true;
    }

    public void fnHandleCreation() {
        if (exit || !creationContexts.containsKey(chatId)) return;

        if (requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) {
            creationContexts.remove(chatId);
            return;
        }

        TaskCreationContext context = creationContexts.get(chatId);
        
        switch (context.state) {
            case WAITING_TITLE:
                context.title = requestText;
                context.state = CreationState.WAITING_DESCRIPTION;
                BotHelper.sendMessageToTelegram(chatId, "Ingresa la DESCRIPCIÓN:", telegramClient);
                exit = true;
                break;

            case WAITING_DESCRIPTION:
                context.description = requestText;
                context.state = CreationState.WAITING_USER_STORY;
                
                List<KeyboardRow> usKeyboard = new ArrayList<>();
                userStoryService.getAllUserStories().forEach(us -> {
                    usKeyboard.add(new KeyboardRow(us.getUserStoriesId() + " - " + us.getName()));
                });
                usKeyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));
                
                BotHelper.sendMessageToTelegram(chatId, "Selecciona la HISTORIA DE USUARIO:", telegramClient,
                    ReplyKeyboardMarkup.builder().resizeKeyboard(true).keyboard(usKeyboard).build());
                exit = true;
                break;

            case WAITING_USER_STORY:
                try {
                    String usId = requestText.split(" - ")[0].trim();
                    context.userStoryId = usId;
                    context.state = CreationState.WAITING_PRIORITY;

                    List<KeyboardRow> pKeyboard = new ArrayList<>();
                    taskPriorityService.getAllTaskPriorities().forEach(p -> {
                        pKeyboard.add(new KeyboardRow(p.getPriorityId() + " - " + p.getPriorityName()));
                    });
                    pKeyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));

                    BotHelper.sendMessageToTelegram(chatId, "⚡ Selecciona la PRIORIDAD:", telegramClient,
                        ReplyKeyboardMarkup.builder().resizeKeyboard(true).keyboard(pKeyboard).build());
                } catch (Exception e) {
                    BotHelper.sendMessageToTelegram(chatId, "Selección inválida. Intenta de nuevo:", telegramClient);
                }
                exit = true;
                break;

            case WAITING_PRIORITY:
                try {
                    Long pId = Long.valueOf(requestText.split(" - ")[0].trim());
                    context.priorityId = pId;
                    context.state = CreationState.WAITING_STORY_POINTS;
                    BotHelper.sendMessageToTelegram(chatId, "Ingresa los STORY POINTS (Número):", telegramClient);
                } catch (Exception e) {
                    BotHelper.sendMessageToTelegram(chatId, "Selección inválida. Intenta de nuevo:", telegramClient);
                }
                exit = true;
                break;

            case WAITING_STORY_POINTS:
                try {
                    Integer points = Integer.valueOf(requestText.trim());
                    context.storyPoints = points;
                    context.state = CreationState.WAITING_SPRINT;

                    List<KeyboardRow> sKeyboard = new ArrayList<>();
                    sprintService.getAllSprints().forEach(s -> {
                        sKeyboard.add(new KeyboardRow(s.getSprintId() + " - Sprint " + s.getSprintNum()));
                    });
                    sKeyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));

                    BotHelper.sendMessageToTelegram(chatId, "Selecciona el SPRINT:", telegramClient,
                        ReplyKeyboardMarkup.builder().resizeKeyboard(true).keyboard(sKeyboard).build());
                } catch (Exception e) {
                    BotHelper.sendMessageToTelegram(chatId, "Por favor ingresa un número válido:", telegramClient);
                }
                exit = true;
                break;

            case WAITING_SPRINT:
                try {
                    Long sId = Long.valueOf(requestText.split(" - ")[0].trim());
                    context.sprintId = sId;
                    context.state = CreationState.WAITING_ASSIGNMENT;

                    List<KeyboardRow> uKeyboard = new ArrayList<>();
                    userService.getAllUsers().forEach(u -> {
                        uKeyboard.add(new KeyboardRow(u.getUserId() + " - " + u.getFirtsName() + " " + u.getLastName()));
                    });
                    uKeyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));

                    BotHelper.sendMessageToTelegram(chatId, "Asigna la tarea a un DESARROLLADOR:", telegramClient,
                        ReplyKeyboardMarkup.builder().resizeKeyboard(true).keyboard(uKeyboard).build());
                } catch (Exception e) {
                    BotHelper.sendMessageToTelegram(chatId, "Selección inválida. Intenta de nuevo:", telegramClient);
                }
                exit = true;
                break;

            case WAITING_ASSIGNMENT:
                try {
                    Long uId = Long.valueOf(requestText.split(" - ")[0].trim());
                    context.assignedUserId = uId;
                    
                    // CREAR TAREA
                    com.springboot.MyTodoList.model.Task newTask = new com.springboot.MyTodoList.model.Task();
                    newTask.setTitle(context.title);
                    newTask.setDescription(context.description);
                    newTask.setStoryPoints(context.storyPoints);
                    newTask.setObjetiveTime(context.storyPoints * 2); // Ejemplo
                    newTask.setDeleted("N");
                    
                    userStoryService.getUserStoryById(context.userStoryId).ifPresent(newTask::setUserStory);
                    taskPriorityService.getTaskPriorityById(context.priorityId).ifPresent(newTask::setPriority);
                    taskStatusService.getTaskStatusById(1L).ifPresent(newTask::setStatus); // Pendiente
                    
                    com.springboot.MyTodoList.model.Task savedTask = taskService.saveTask(newTask);
                    
                    // ASIGNAR A SPRINT
                    sprintService.getSprintById(context.sprintId).ifPresent(sprint -> {
                        sprintTaskService.assignTaskToSprint(savedTask, sprint);
                    });
                    
                    // ASIGNAR A USUARIO
                    userService.getUserById(uId).ifPresent(user -> {
                        taskUserService.saveTaskUser(new com.springboot.MyTodoList.model.TaskUser(savedTask, user));
                    });
                    
                    BotHelper.sendMessageToTelegram(chatId, "✅ ¡Tarea \"" + savedTask.getTitle() + "\" creada y asignada correctamente!", telegramClient);
                    creationContexts.remove(chatId);
                    exit = true;
                    fnStart(); // Volver al inicio
                } catch (Exception e) {
                    logger.error("Error al crear tarea: " + e.getLocalizedMessage());
                    BotHelper.sendMessageToTelegram(chatId, "Error al crear la tarea. Intenta de nuevo.", telegramClient);
                }
                exit = true;
                break;
        }
    }

    public void fnAIProgress() {
        if (!(requestText.equals(BotCommands.AI_PROGRESS.getCommand()) || 
              requestText.equals(BotLabels.AI_PROGRESS.getLabel())) || exit)
            return;

        pendingTaskHours.remove(chatId);
        creationContexts.remove(chatId);
        
        Optional<User> userOpt = userService.getUserByTelegramId(chatId);
        if (userOpt.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "No encontré un usuario vinculado a tu Telegram ID (" + chatId + ").", telegramClient);
            exit = true;
            return;
        }

        User user = userOpt.get();
        List<TaskUser> assignedTasks = taskUserService.getTasksByUserId(user.getUserId());

        if (assignedTasks.isEmpty()) {
            BotHelper.sendMessageToTelegram(chatId, "Hola " + user.getFirtsName() + ", actualmente no tienes tareas asignadas.", telegramClient);
            exit = true;
            return;
        }

        StringBuilder tasksInfo = new StringBuilder();
        tasksInfo.append("Usuario: ").append(user.getFirtsName()).append(" ").append(user.getLastName()).append("\n");
        tasksInfo.append("Tareas asignadas:\n");
        for (TaskUser tu : assignedTasks) {
            Task t = tu.getTask();
            tasksInfo.append("- ").append(t.getTitle())
                     .append(" (Estado: ").append(t.getStatus() != null ? t.getStatus().getStatus() : "N/A")
                     .append(", Prioridad: ").append(t.getPriority() != null ? t.getPriority().getPriorityName() : "N/A")
                     .append(")\n");
        }

        String prompt = "Eres un asistente de gestión de proyectos para desarrolladores. " +
                        "Analiza el siguiente progreso del desarrollador y dale un resumen motivador y sugerencias de qué priorizar hoy basado en el estado y la prioridad de sus tareas:\n\n" + 
                        tasksInfo.toString();

        BotHelper.sendMessageToTelegram(chatId, "Consultando con la IA sobre tu progreso...", telegramClient);

        try {
            String aiResponse = deepSeekService.generateText(prompt);
            BotHelper.sendMessageToTelegram(chatId, aiResponse, telegramClient);
        } catch (Exception e) {
            logger.error("Error al consultar Gemini: {}", e.getMessage());
            BotHelper.sendMessageToTelegram(chatId, "Lo siento, hubo un error al consultar a la IA. Inténtalo más tarde.", telegramClient);
        }
        
        // Volvemos al menú principal
        exit = false;
        fnStart();
        exit = true;
    }

    public void fnElse(){
        if(exit || requestText.equals("ignore"))
            return;
        
        BotHelper.sendMessageToTelegram(chatId, "Usa /todolist para ver tus tareas.", telegramClient);
        exit = true;
    }

    public void fnLLM(){
        if (!(requestText.contains(BotCommands.LLM_REQ.getCommand())) || exit)
            return;
        
        String prompt = "Dame los datos del clima en mty";
        String out = "<empty>";
        try{
            out = deepSeekService.generateText(prompt);
        }catch(Exception exc){
            logger.error("Error al consultar Gemini: {}", exc.getMessage());
        }

        //BotHelper.sendMessageToTelegram(chatId, "LLM: "+out, telegramClient, null);
    }
}
