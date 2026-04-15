package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    @Procedure(procedureName = "CREATE_TASK_AND_ASSIGN")
    void createTaskAndAssign(
        @Param("p_user_stories_id") String userStoriesId,
        @Param("p_title") String title,
        @Param("p_description") String description,
        @Param("p_status") String status,
        @Param("p_story_points") Integer storyPoints,
        @Param("p_priority") String priority,
        @Param("p_objective_time") Integer objectiveTime,
        @Param("p_creator_user_id") Long creatorUserId
    );
}
