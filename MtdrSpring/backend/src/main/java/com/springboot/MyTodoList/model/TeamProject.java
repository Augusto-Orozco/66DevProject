package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "TEAM_PROJECT")
public class TeamProject {

    @EmbeddedId
    private TeamProjectId id;

    @ManyToOne
    @MapsId("projectId")
    @JoinColumn(name = "PROJECT_ID")
    private Project project;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "USER_ID")
    private User user;

    public TeamProject() {}

    public TeamProject(Project project, User user) {
        this.project = project;
        this.user = user;
        this.id = new TeamProjectId(project.getProjectId(), user.getUserId());
    }

    public TeamProjectId getId() {
        return id;
    }

    public void setId(TeamProjectId id) {
        this.id = id;
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
                "project=" + (project != null ? project.getName() : "null") +
                ", user=" + (user != null ? user.getFirtsName() : "null") +
                '}';
    }

    @Embeddable
    public static class TeamProjectId implements Serializable {
        @Column(name = "PROJECT_ID")
        private Long projectId;

        @Column(name = "USER_ID")
        private Long userId;

        public TeamProjectId() {}

        public TeamProjectId(Long projectId, Long userId) {
            this.projectId = projectId;
            this.userId = userId;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
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
            TeamProjectId that = (TeamProjectId) o;
            return Objects.equals(projectId, that.projectId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(projectId, userId);
        }
    }
}
