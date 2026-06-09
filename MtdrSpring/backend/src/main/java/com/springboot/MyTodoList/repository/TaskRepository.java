package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserStory_UserStoriesIdAndDeleted(String userStoryId, String deleted);

    List<Task> findByProject_ProjectIdAndDeleted(Long projectId, String deleted);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.project.projectId = :projectId AND t.deleted = 'N' AND t.taskId NOT IN (SELECT st.id.taskId FROM SprintTask st)")
    List<Task> findUnassignedTasksByProject(@org.springframework.data.repository.query.Param("projectId") Long projectId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.deleted = 'N' AND t.taskId NOT IN (SELECT st.id.taskId FROM SprintTask st)")
    List<Task> findUnassignedTasks();

    List<Task> findAllByDeleted(String deleted);
}
