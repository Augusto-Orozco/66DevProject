package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "USER_STORIES")
public class UserStory {

    @Id
    @Column(name = "USER_STORIES_ID", length = 10)
    private String userStoriesId;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "DESCRIPTION", nullable = false, length = 255)
    private String description;

    public UserStory() {}

    public UserStory(String userStoriesId, String name, String description) {
        this.userStoriesId = userStoriesId;
        this.name = name;
        this.description = description;
    }

    public String getUserStoriesId() {
        return userStoriesId;
    }

    public void setUserStoriesId(String userStoriesId) {
        this.userStoriesId = userStoriesId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "UserStory{" +
                "userStoriesId='" + userStoriesId + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
