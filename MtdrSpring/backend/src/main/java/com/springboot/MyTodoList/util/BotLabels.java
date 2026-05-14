package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Volver"), 
	HIDE_MAIN_SCREEN("Cerrar conversación"),
	LIST_ALL_ITEMS("Tareas Pendientes"), 
	ADD_NEW_ITEM("Iniciar Nueva Tarea"),
	CREATE_TASK("Crear Tarea"),
	AI_PROGRESS("Consultar mi Progreso"),
	DONE("Completada"),
	IN_PROGRESS("En Progreso"),
	UNDO("Pendiente"),
	DELETE("Borrar este label"),
	MY_TODO_LIST("MY TODO LIST"),
	DASH(" ");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
