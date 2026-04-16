package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "SPRINT_TASK")
public class SprintTask {

    @EmbeddedId
    private SprintTaskId id;

    @ManyToOne
    @MapsId("sprintId")
    @JoinColumn(name = "SPRINT_ID")
    private Sprint sprint;

    @ManyToOne
    @MapsId("taskId")
    @JoinColumn(name = "TASK_ID")
    private Task task;

    @Column(name = "ASSIGNED_AT", nullable = false, insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "IS_CARRYOVER", nullable = false, columnDefinition = "CHAR(1)")
    private String isCarryover; // 'Y' or 'N'

    public SprintTask() {}

    public SprintTask(Sprint sprint, Task task, String isCarryover) {
        this.sprint = sprint;
        this.task = task;
        this.isCarryover = isCarryover;
        this.id = new SprintTaskId(sprint.getSprintId(), task.getTaskId());
    }

    public SprintTaskId getId() {
        return id;
    }

    public void setId(SprintTaskId id) {
        this.id = id;
    }

    public Sprint getSprint() {
        return sprint;
    }

    public void setSprint(Sprint sprint) {
        this.sprint = sprint;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getIsCarryover() {
        return isCarryover;
    }

    public void setIsCarryover(String isCarryover) {
        this.isCarryover = isCarryover;
    }

    @Override
    public String toString() {
        return "SprintTask{" +
                "id=" + id +
                ", isCarryover='" + isCarryover + '\'' +
                '}';
    }

    @Embeddable
    public static class SprintTaskId implements Serializable {
        @Column(name = "SPRINT_ID")
        private Long sprintId;

        @Column(name = "TASK_ID")
        private Long taskId;

        public SprintTaskId() {}

        public SprintTaskId(Long sprintId, Long taskId) {
            this.sprintId = sprintId;
            this.taskId = taskId;
        }

        public Long getSprintId() {
            return sprintId;
        }

        public void setSprintId(Long sprintId) {
            this.sprintId = sprintId;
        }

        public Long getTaskId() {
            return taskId;
        }

        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            SprintTaskId that = (SprintTaskId) o;
            return Objects.equals(sprintId, that.sprintId) && Objects.equals(taskId, that.taskId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(sprintId, taskId);
        }
    }
}
