package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.TaskUser.TaskUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskUserRepository extends JpaRepository<TaskUser, TaskUserId> {
    List<TaskUser> findByIdUserId(Long userId);
}
