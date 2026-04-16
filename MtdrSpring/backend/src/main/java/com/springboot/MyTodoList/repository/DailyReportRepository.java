package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {
}
