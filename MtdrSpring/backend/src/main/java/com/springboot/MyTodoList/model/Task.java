package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TASKS")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TASK_ID")
    private Long taskId;

    @ManyToOne
    @JoinColumn(name = "USER_STORIES_ID", nullable = false)
    private UserStory userStory;

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "DESCRIPTION", nullable = false, length = 500)
    private String description;

    @ManyToOne
    @JoinColumn(name = "STATUS")
    private TaskStatus status;

    @Column(name = "STORY_POINTS", nullable = false, columnDefinition = "NUMBER")
    private Integer storyPoints;

    @ManyToOne
    @JoinColumn(name = "PRIORITY")
    private TaskPriority priority;

    @Column(name = "OBJETIVE_TIME", nullable = false, columnDefinition = "NUMBER")
    private Integer objetiveTime; // Matching typo: OBJETIVE

    @Column(name = "REAL_TIME", columnDefinition = "NUMBER")
    private Integer realTime;

    @Column(name = "CREATED_AT", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "FINISHED_AT")
    private LocalDateTime finishedAt;

    @Column(name = "DELETED", nullable = false, columnDefinition = "CHAR(1)")
    private String deleted; // 'Y' or 'N'

    @Column(name = "DELETED_BY")
    private Long deletedBy;

    public Task() {}

    public Task(UserStory userStory, String title, String description, TaskStatus status, Integer storyPoints, TaskPriority priority, Integer objetiveTime) {
        this.userStory = userStory;
        this.title = title;
        this.description = description;
        this.status = status;
        this.storyPoints = storyPoints;
        this.priority = priority;
        this.objetiveTime = objetiveTime;
        this.deleted = "N";
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public UserStory getUserStory() {
        return userStory;
    }

    public void setUserStory(UserStory userStory) {
        this.userStory = userStory;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public Integer getObjetiveTime() {
        return objetiveTime;
    }

    public void setObjetiveTime(Integer objetiveTime) {
        this.objetiveTime = objetiveTime;
    }

    public Integer getRealTime() {
        return realTime;
    }

    public void setRealTime(Integer realTime) {
        this.realTime = realTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }

    public Long getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(Long deletedBy) {
        this.deletedBy = deletedBy;
    }

    @Override
    public String toString() {
        return "Task{" +
                "taskId=" + taskId +
                ", title='" + title + '\'' +
                ", status=" + (status != null ? status.getStatus() : "null") +
                ", priority=" + (priority != null ? priority.getPriorityName() : "null") +
                '}';
    }
}
