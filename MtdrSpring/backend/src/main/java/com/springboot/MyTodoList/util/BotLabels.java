package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Reiniciar conversación"), 
	HIDE_MAIN_SCREEN("Cerrar conversación"),
	LIST_ALL_ITEMS("Lista de Tareas"), 
	ADD_NEW_ITEM("Borrar este Label"),
	DONE("Completada"),
	IN_PROGRESS("En Progreso"),
	UNDO("Pendiente"),
	DELETE("Borrar este label"),
	MY_TODO_LIST("MY TODO LIST"),
	DASH("-");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
