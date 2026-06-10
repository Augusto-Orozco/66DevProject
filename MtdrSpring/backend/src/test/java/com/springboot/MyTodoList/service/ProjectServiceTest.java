package com.springboot.MyTodoList.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ProjectService projectService;

    @Test
    @SuppressWarnings("unchecked")
    void testGetProjectDashboardSummary() {
        // Arrange
        Long projectId = 1L;
        String expectedSummary = "{ \"kpis\": \"data\" }";
        
        when(jdbcTemplate.execute(anyString(), any(CallableStatementCallback.class)))
            .thenReturn(expectedSummary);

        // Act
        String result = projectService.getProjectDashboardSummary(projectId);

        // Assert
        assertEquals(expectedSummary, result);
        verify(jdbcTemplate).execute(eq("{call GET_PROJECT_DASHBOARD_SUMMARY(?, ?)}"), any(CallableStatementCallback.class));
    }
}
