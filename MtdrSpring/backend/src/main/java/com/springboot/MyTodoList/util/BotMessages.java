package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hello! I'm OraBot!\nEsta es una prueba para redirigir a los devs para marcar sus tareas como realizadas o no realizadas :D:"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Tarea Completada! preciona /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Tarea No Completada :c, Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
