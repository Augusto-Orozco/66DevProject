package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskPriorityRepository extends JpaRepository<TaskPriority, Long> {
}
