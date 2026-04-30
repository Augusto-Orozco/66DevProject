package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TeamProject;
import com.springboot.MyTodoList.model.TeamProject.TeamProjectId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamProjectRepository extends JpaRepository<TeamProject, TeamProjectId> {
    List<TeamProject> findByIdProjectId(Long projectId);
    List<TeamProject> findByIdUserId(Long userId);
}
