package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.TeamProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamProjectRepository extends JpaRepository<TeamProject, Long> {
}
