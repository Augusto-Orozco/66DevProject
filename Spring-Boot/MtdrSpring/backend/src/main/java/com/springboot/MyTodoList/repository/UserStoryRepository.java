package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, String> {
}
