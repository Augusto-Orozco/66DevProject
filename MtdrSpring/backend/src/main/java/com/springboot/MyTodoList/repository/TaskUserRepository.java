package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TaskUser;
import com.springboot.MyTodoList.model.TaskUser.TaskUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskUserRepository extends JpaRepository<TaskUser, TaskUserId> {
    List<TaskUser> findByIdUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT tu FROM TaskUser tu JOIN FETCH tu.task t JOIN FETCH tu.user u WHERE t.project.projectId = :projectId")
    List<TaskUser> findByProjectId(@org.springframework.data.repository.query.Param("projectId") Long projectId);
}
