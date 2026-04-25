package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserStory_UserStoriesId(String userStoryId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.taskId NOT IN (SELECT st.id.taskId FROM SprintTask st)")
    List<Task> findUnassignedTasks();
}
