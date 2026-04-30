package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TeamProject;
import com.springboot.MyTodoList.model.TeamProject.TeamProjectId;
import com.springboot.MyTodoList.repository.TeamProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TeamProjectService {

    @Autowired
    private TeamProjectRepository teamProjectRepository;

    public List<TeamProject> getAllTeamProjects() {
        return teamProjectRepository.findAll();
    }

    public List<TeamProject> getTeamProjectsByProjectId(Long projectId) {
        return teamProjectRepository.findByIdProjectId(projectId);
    }

    public List<TeamProject> getTeamProjectsByUserId(Long userId) {
        return teamProjectRepository.findByIdUserId(userId);
    }

    public Optional<TeamProject> getTeamProjectById(TeamProjectId id) {
        return teamProjectRepository.findById(id);
    }

    public TeamProject saveTeamProject(TeamProject teamProject) {
        return teamProjectRepository.save(teamProject);
    }

    public void deleteTeamProject(TeamProjectId id) {
        teamProjectRepository.deleteById(id);
    }
}
