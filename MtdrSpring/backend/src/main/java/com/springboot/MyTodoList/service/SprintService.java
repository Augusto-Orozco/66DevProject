package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
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
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Sprint saveSprint(Sprint sprint) {
        if (sprint.getSprintNum() == null) {
            int nextNum = sprintRepository.findFirstByProjectOrderBySprintNumDesc(sprint.getProject())
                    .map(lastSprint -> lastSprint.getSprintNum() + 1)
                    .orElse(1);
            sprint.setSprintNum(nextNum);
        }
        return sprintRepository.save(sprint);
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public List<Sprint> getSprintsByProjectId(Long projectId) {
        return sprintRepository.findByProject_ProjectId(projectId);
    }

    public Optional<Sprint> getSprintById(Long id) {
        return sprintRepository.findById(id);
    }

    public void deleteSprint(Long id) {
        sprintRepository.deleteById(id);
    }

    public String getProjectSprintsHierarchy(Long projectId) {
        return jdbcTemplate.execute(
            "{call GET_PROJECT_SPRINTS_HIERARCHY(?, ?)}",
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
