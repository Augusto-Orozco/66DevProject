package com.springboot.MyTodoList.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.jdbc.core.CallableStatementCallback;
import java.sql.Types;
import java.sql.Clob;

@RestController
public class DiagnosticController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/diag/tables")
    public List<Map<String, Object>> listTables() {
        // Lista las tablas del usuario actual
        return jdbcTemplate.queryForList("SELECT table_name FROM user_tables");
    }

    @GetMapping("/diag/users-structure")
    public List<Map<String, Object>> inspectUserTable() {
        // Muestra las columnas de la tabla USERS
        return jdbcTemplate.queryForList(
            "SELECT column_name, data_type, data_length, nullable " +
            "FROM user_tab_columns WHERE table_name = 'USERS' ORDER BY column_id"
        );
    }

    @GetMapping("/diag/users-data")
    public List<Map<String, Object>> listUsers() {
        // Intenta traer los datos de la tabla USERS
        try {
            return jdbcTemplate.queryForList("SELECT * FROM USERS");
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return List.of(error);
        }
    }

    @GetMapping("/diag/check-connection")
    public Map<String, Object> checkConnection() {
        Map<String, Object> info = new HashMap<>();
        try {
            String dbUser = jdbcTemplate.queryForObject("SELECT USER FROM DUAL", String.class);
            String dbVersion = jdbcTemplate.queryForObject("SELECT banner FROM v$version WHERE ROWNUM = 1", String.class);
            info.put("status", "Connected");
            info.put("current_user", dbUser);
            info.put("database_version", dbVersion);
        } catch (Exception e) {
            info.put("status", "Error");
            info.put("message", e.getMessage());
        }
        return info;
    }

    @GetMapping("/diag/test-sp-dashboard")
    public Map<String, Object> testDashboardSP() {
        Map<String, Object> info = new HashMap<>();
        try {
            Long testProjectId = 1L;
            
            String result = jdbcTemplate.execute(
                "{call GET_PROJECT_DASHBOARD_SUMMARY(?, ?)}",
                (CallableStatementCallback<String>) cs -> {
                    cs.setLong(1, testProjectId);
                    cs.registerOutParameter(2, Types.CLOB);
                    cs.execute();
                    Clob clob = cs.getClob(2);
                    return (clob != null) ? clob.getSubString(1, (int) clob.length()) : null;
                }
            );

            info.put("status", "Success");
            info.put("project_id", testProjectId);
            info.put("result", result);
        } catch (Exception e) {
            info.put("status", "Error");
            info.put("message", e.getMessage());
        }
        return info;
    }

    @GetMapping("/diag/test-sp-sprints")
    public Map<String, Object> testSprintsSP() {
        Map<String, Object> info = new HashMap<>();
        try {
            Long testProjectId = 1L;
            
            String result = jdbcTemplate.execute(
                "{call GET_PROJECT_SPRINTS_HIERARCHY(?, ?)}",
                (CallableStatementCallback<String>) cs -> {
                    cs.setLong(1, testProjectId);
                    cs.registerOutParameter(2, Types.CLOB);
                    cs.execute();
                    Clob clob = cs.getClob(2);
                    return (clob != null) ? clob.getSubString(1, (int) clob.length()) : null;
                }
            );

            info.put("status", "Success");
            info.put("project_id", testProjectId);
            info.put("result", result);
        } catch (Exception e) {
            info.put("status", "Error");
            info.put("message", e.getMessage());
        }
        return info;
    }

    @GetMapping("/diag/user-stories-data")
    public List<Map<String, Object>> listUserStories() {
        try {
            return jdbcTemplate.queryForList("SELECT * FROM USER_STORIES");
        } catch (Exception e) {
            return List.of(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/diag/test-atomic-task")
    public Map<String, Object> testAtomicTask() {
        Map<String, Object> info = new HashMap<>();
        try {
            // Intentamos encontrar IDs válidos dinámicamente para que el test no falle por integridad
            Long validProjectId = jdbcTemplate.queryForObject("SELECT PROJECT_ID FROM PROJECTS FETCH FIRST 1 ROW ONLY", Long.class);
            String validStoryId = jdbcTemplate.queryForObject("SELECT USER_STORIES_ID FROM USER_STORIES FETCH FIRST 1 ROW ONLY", String.class);
            Long validPriorityId = jdbcTemplate.queryForObject("SELECT PRIORITY_ID FROM TASK_PRIORITIES FETCH FIRST 1 ROW ONLY", Long.class);

            String sql = "{call CREATE_TASK_ATOMIC(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
            
            Long taskId = jdbcTemplate.execute(sql, (org.springframework.jdbc.core.CallableStatementCallback<Long>) cs -> {
                cs.setString(1, "Tarea de Diagnóstico " + System.currentTimeMillis());
                cs.setString(2, "Descripción generada automáticamente por el test");
                cs.setLong(3, validProjectId); 
                cs.setString(4, validStoryId); 
                cs.setLong(5, validPriorityId); 
                cs.setInt(6, 5);   
                cs.setInt(7, 8);   
                cs.setNull(8, java.sql.Types.NUMERIC); 
                cs.setNull(9, java.sql.Types.NUMERIC); 
                cs.registerOutParameter(10, java.sql.Types.NUMERIC);
                cs.execute();
                return cs.getLong(10);
            });

            info.put("status", "Success");
            info.put("new_task_id", taskId);
            info.put("used_project_id", validProjectId);
            info.put("used_story_id", validStoryId);
            info.put("message", "La tarea atómica se creó correctamente usando IDs dinámicos.");
        } catch (Exception e) {
            info.put("status", "Error");
            info.put("error_type", e.getClass().getName());
            info.put("message", e.getMessage());
        }
        return info;
    }
}
