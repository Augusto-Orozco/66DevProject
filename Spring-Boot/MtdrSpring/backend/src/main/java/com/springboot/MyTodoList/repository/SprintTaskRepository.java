package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.SprintTask.SprintTaskId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintTaskRepository extends JpaRepository<SprintTask, SprintTaskId> {
}
