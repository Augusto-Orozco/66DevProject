package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.model.SprintTask.SprintTaskId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintTaskRepository extends JpaRepository<SprintTask, SprintTaskId> {
    List<SprintTask> findById_SprintId(Long sprintId);
    java.util.Optional<SprintTask> findById_TaskId(Long taskId);
    void deleteById_TaskId(Long taskId);
}
