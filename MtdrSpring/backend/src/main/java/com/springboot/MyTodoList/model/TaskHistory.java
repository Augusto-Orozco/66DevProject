package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TASK_HISTORY")
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HISTORY_ID")
    private Long historyId;

    @ManyToOne
    @JoinColumn(name = "TASK_ID", nullable = false)
    private Task task;

    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CHANGES", nullable = false, length = 100)
    private String changes;

    @Column(name = "CHANGED_AT", nullable = false, insertable = false, updatable = false)
    private LocalDateTime changedAt;

    public TaskHistory() {}

    public TaskHistory(Task task, User user, String changes) {
        this.task = task;
        this.user = user;
        this.changes = changes;
    }

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getChanges() {
        return changes;
    }

    public void setChanges(String changes) {
        this.changes = changes;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    @Override
    public String toString() {
        return "TaskHistory{" +
                "historyId=" + historyId +
                ", changes='" + changes + '\'' +
                ", changedAt=" + changedAt +
                '}';
    }
}
