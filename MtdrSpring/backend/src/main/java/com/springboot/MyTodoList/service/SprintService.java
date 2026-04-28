package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

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

    public Optional<Sprint> getSprintById(Long id) {
        return sprintRepository.findById(id);
    }

    public void deleteSprint(Long id) {
        sprintRepository.deleteById(id);
    }
}
