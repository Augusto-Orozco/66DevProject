package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.TeamProject;
import com.springboot.MyTodoList.repository.TeamProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamProjectService {

    @Autowired
    private TeamProjectRepository teamProjectRepository;

    public TeamProject saveTeamProject(TeamProject teamProject) {
        return teamProjectRepository.save(teamProject);
    }

    public List<TeamProject> getAllTeamProjects() {
        return teamProjectRepository.findAll();
    }

    public Optional<TeamProject> getTeamProjectById(Long id) {
        return teamProjectRepository.findById(id);
    }

    public void deleteTeamProject(Long id) {
        teamProjectRepository.deleteById(id);
    }
}
