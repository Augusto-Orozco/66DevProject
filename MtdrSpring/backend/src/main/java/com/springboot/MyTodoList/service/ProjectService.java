package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import java.sql.Types;
import java.sql.Clob;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Project saveProject(Project project) {
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public String getProjectDashboardSummary(Long projectId) {
        return jdbcTemplate.execute(
            "{call GET_PROJECT_DASHBOARD_SUMMARY(?, ?)}",
            (CallableStatementCallback<String>) cs -> {
                cs.setLong(1, projectId);
                cs.registerOutParameter(2, Types.CLOB);
                cs.execute();
                
                Clob clob = cs.getClob(2);
                if (clob != null) {
                    try {
                        return clob.getSubString(1, (int) clob.length());
                    } finally {
                        try { clob.free(); } catch (SQLException ignored) {}
                    }
                }
                return null;
            }
        );
    }
}
