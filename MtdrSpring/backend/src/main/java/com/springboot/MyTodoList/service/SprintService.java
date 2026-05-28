package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.SprintTask;
import com.springboot.MyTodoList.repository.SprintTaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    private SprintTaskRepository sprintTaskRepository;

    @Autowired
    private com.springboot.MyTodoList.repository.TaskUserRepository taskUserRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        try {
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
                    return "[]";
                }
            );
        } catch (Exception e) {
            // Fallback to manual JPA build if SP fails (common in Oracle with data edge cases)
            return buildHierarchyManual(projectId);
        }
    }

    private String buildHierarchyManual(Long projectId) {
        try {
            List<Sprint> sprints = sprintRepository.findByProject_ProjectId(projectId);
            List<com.springboot.MyTodoList.model.TaskUser> allAssignments = taskUserRepository.findByProjectId(projectId);
            ArrayNode rootArray = objectMapper.createArrayNode();
            
            for (Sprint sprint : sprints) {
                ObjectNode sprintNode = objectMapper.createObjectNode();
                sprintNode.put("sprintId", sprint.getSprintId());
                sprintNode.put("sprintNum", sprint.getSprintNum());
                sprintNode.put("startDate", sprint.getStartDate().toString());
                sprintNode.put("endDate", sprint.getEndDate().toString());
                
                ArrayNode tasksArray = objectMapper.createArrayNode();
                List<SprintTask> sprintTasks = sprintTaskRepository.findById_SprintId(sprint.getSprintId());
                
                for (SprintTask st : sprintTasks) {
                    if (st.getTask() != null) {
                        ObjectNode taskNode = objectMapper.createObjectNode();
                        taskNode.put("taskId", st.getTask().getTaskId());
                        taskNode.put("title", st.getTask().getTitle());
                        taskNode.put("description", st.getTask().getDescription());
                        taskNode.put("storyPoints", st.getTask().getStoryPoints());
                        taskNode.put("objetiveTime", st.getTask().getObjetiveTime());
                        
                        if (st.getTask().getPriority() != null) {
                            ObjectNode priorityNode = objectMapper.createObjectNode();
                            priorityNode.put("priorityId", st.getTask().getPriority().getPriorityId());
                            priorityNode.put("priorityName", st.getTask().getPriority().getPriorityName());
                            taskNode.set("priority", priorityNode);
                        }

                        if (st.getTask().getUserStory() != null) {
                            ObjectNode storyNode = objectMapper.createObjectNode();
                            storyNode.put("userStoriesId", st.getTask().getUserStory().getUserStoriesId());
                            storyNode.put("name", st.getTask().getUserStory().getName());
                            taskNode.set("userStory", storyNode);
                        }

                        // Buscar el usuario asignado en la lista previamente cargada
                        Long assignedId = allAssignments.stream()
                            .filter(tu -> tu.getTask().getTaskId().equals(st.getTask().getTaskId()))
                            .map(tu -> tu.getUser().getUserId())
                            .findFirst()
                            .orElse(null);
                        
                        if (assignedId != null) {
                            taskNode.put("assignedUserId", assignedId);
                        }

                        tasksArray.add(taskNode);
                    }
                }
                sprintNode.set("tasks", tasksArray);
                rootArray.add(sprintNode);
            }
            return objectMapper.writeValueAsString(rootArray);
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }
}
