package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.UserStory;
import com.springboot.MyTodoList.repository.UserStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserStoryService {

    @Autowired
    private UserStoryRepository userStoryRepository;

    public UserStory saveUserStory(UserStory userStory) {
        return userStoryRepository.save(userStory);
    }

    public List<UserStory> getAllUserStories() {
        return userStoryRepository.findAll();
    }

    public Optional<UserStory> getUserStoryById(String id) {
        return userStoryRepository.findById(id);
    }

    public void deleteUserStory(String id) {
        userStoryRepository.deleteById(id);
    }
}
