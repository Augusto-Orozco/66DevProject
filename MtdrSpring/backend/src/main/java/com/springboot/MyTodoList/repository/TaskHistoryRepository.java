package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    java.util.Optional<TaskHistory> findFirstByTask_TaskIdOrderByChangedAtDesc(Long taskId);

    List<TaskHistory> findByTask_Project_ProjectIdOrderByChangedAtDesc(Long projectId);

    @Query("SELECT th FROM TaskHistory th WHERE th.historyId IN " +
           "(SELECT MAX(th2.historyId) FROM TaskHistory th2 WHERE th2.task.taskId IN :taskIds GROUP BY th2.task.taskId)")
    List<TaskHistory> findLatestHistoryByTaskIds(@Param("taskIds") List<Long> taskIds);
}
