package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "TASK_USERS")
public class TaskUser {

    @EmbeddedId
    private TaskUserId id;

    @ManyToOne
    @MapsId("taskId")
    @JoinColumn(name = "TASK_ID")
    private Task task;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "ASSIGNED_AT", nullable = false, insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    public TaskUser() {}

    public TaskUser(Task task, User user) {
        this.task = task;
        this.user = user;
        this.id = new TaskUserId(task.getTaskId(), user.getUserId());
    }

    public TaskUserId getId() {
        return id;
    }

    public void setId(TaskUserId id) {
        this.id = id;
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

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    @Override
    public String toString() {
        return "TaskUser{" +
                "id=" + id +
                ", assignedAt=" + assignedAt +
                '}';
    }

    @Embeddable
    public static class TaskUserId implements Serializable {
        @Column(name = "TASK_ID")
        private Long taskId;

        @Column(name = "USER_ID")
        private Long userId;

        public TaskUserId() {}

        public TaskUserId(Long taskId, Long userId) {
            this.taskId = taskId;
            this.userId = userId;
        }

        public Long getTaskId() {
            return taskId;
        }

        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TaskUserId that = (TaskUserId) o;
            return Objects.equals(taskId, that.taskId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(taskId, userId);
        }
    }
}
