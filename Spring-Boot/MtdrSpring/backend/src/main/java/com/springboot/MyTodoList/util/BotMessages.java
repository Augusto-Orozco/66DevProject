package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"¡Hola! Soy tu Asistente de Tareas.\nSelecciona una opción o crea una tarea directamente con el formato:\nID_HISTORIA: Título, Descripción"),
	BOT_REGISTERED_STARTED("¡Bot registrado y listo!"),
	ITEM_DONE("¡Tarea completada! Selecciona /todolist o /start."), 
	ITEM_UNDONE("¡Tarea reabierta! Selecciona /todolist o /start."), 
	ITEM_DELETED("¡Tarea eliminada! Selecciona /todolist o /start."),
	TYPE_NEW_TODO_ITEM("Para añadir una tarea usa el formato:\nID_HISTORIA: Título, Descripción, [Prioridad], [Puntos], [Tiempo]"),
	NEW_ITEM_ADDED("¡Nueva tarea añadida con éxito!"),
	BYE("¡Adiós! Escribe /start para volver.");


	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
