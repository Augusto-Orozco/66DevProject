package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TASK_PRIORITIES")
public class TaskPriority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRIORITY_ID")
    private Long priorityId;

    @Column(name = "PRIORITY_NAME", nullable = false, unique = true, length = 50)
    private String priorityName;

    public TaskPriority() {
    }

    public TaskPriority(String priorityName) {
        this.priorityName = priorityName;
    }

    public TaskPriority(Long priorityId, String priorityName) {
        this.priorityId = priorityId;
        this.priorityName = priorityName;
    }

    public Long getPriorityId() {
        return priorityId;
    }

    public void setPriorityId(Long priorityId) {
        this.priorityId = priorityId;
    }

    public String getPriorityName() {
        return priorityName;
    }

    public void setPriorityName(String priorityName) {
        this.priorityName = priorityName;
    }

    @Override
    public String toString() {
        return "TaskPriority{" +
                "priorityId=" + priorityId +
                ", priorityName='" + priorityName + '\'' +
                '}';
    }
}

