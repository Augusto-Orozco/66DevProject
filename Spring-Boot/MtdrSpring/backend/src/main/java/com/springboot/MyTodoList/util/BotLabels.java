package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Ver Pantalla Principal"), 
	HIDE_MAIN_SCREEN("Ocultar Menú"),
	LIST_ALL_ITEMS("Listar mis Tareas"), 
	ADD_NEW_ITEM("Añadir Nueva Tarea"),
	DONE("COMPLETA"),
	UNDO("DESHACER"),
	DELETE("ELIMINAR"),
	MY_TODO_LIST("MIS TAREAS ACTUALES"),
	DASH("-");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
