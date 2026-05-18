package com.springboot.MyTodoList.util;

public class TaskDTO {
    private String title;
    private String description;
    private Long projectId;
    private String userStoryId;
    private Long priorityId;
    private Integer storyPoints;
    private Integer objectiveTime;
    private Long sprintId;
    private Long assignedUserId;

    public TaskDTO() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getUserStoryId() { return userStoryId; }
    public void setUserStoryId(String userStoryId) { this.userStoryId = userStoryId; }

    public Long getPriorityId() { return priorityId; }
    public void setPriorityId(Long priorityId) { this.priorityId = priorityId; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Integer getObjectiveTime() { return objectiveTime; }
    public void setObjectiveTime(Integer objectiveTime) { this.objectiveTime = objectiveTime; }

    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }

    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
}
