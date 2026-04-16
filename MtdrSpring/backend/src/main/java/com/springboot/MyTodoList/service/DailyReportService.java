package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.DailyReport;
import com.springboot.MyTodoList.repository.DailyReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DailyReportService {

    @Autowired
    private DailyReportRepository dailyReportRepository;

    public DailyReport saveDailyReport(DailyReport dailyReport) {
        return dailyReportRepository.save(dailyReport);
    }

    public List<DailyReport> getAllDailyReports() {
        return dailyReportRepository.findAll();
    }

    public Optional<DailyReport> getDailyReportById(Long id) {
        return dailyReportRepository.findById(id);
    }

    public void deleteDailyReport(Long id) {
        dailyReportRepository.deleteById(id);
    }
}
