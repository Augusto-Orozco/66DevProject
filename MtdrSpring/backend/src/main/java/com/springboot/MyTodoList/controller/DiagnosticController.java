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
}
