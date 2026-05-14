package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Optional<Sprint> findFirstByProjectOrderBySprintNumDesc(Project project);
    java.util.List<Sprint> findByProject_ProjectId(Long projectId);
}
