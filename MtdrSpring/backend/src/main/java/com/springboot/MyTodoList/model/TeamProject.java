package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TEAM_PROJECT")
public class TeamProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TEAM_ID")
    private Long teamId;

    @ManyToOne
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    public TeamProject() {}

    public TeamProject(Project project, User user) {
        this.project = project;
        this.user = user;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    @Override
    public String toString() {
        return "TeamProject{" +
                "teamId=" + teamId +
                ", project=" + project +
                ", user=" + user +
                '}';
    }
}
