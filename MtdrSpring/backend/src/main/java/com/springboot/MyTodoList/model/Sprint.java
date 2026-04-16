package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SPRINTS")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SPRINT_ID")
    private Long sprintId;

    @ManyToOne
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @Column(name = "START_DATE", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDateTime endDate;

    public Sprint() {}

    public Sprint(Project project, LocalDateTime startDate, LocalDateTime endDate) {
        this.project = project;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getSprintId() {
        return sprintId;
    }

    public void setSprintId(Long sprintId) {
        this.sprintId = sprintId;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    @Override
    public String toString() {
        return "Sprint{" +
                "sprintId=" + sprintId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}
