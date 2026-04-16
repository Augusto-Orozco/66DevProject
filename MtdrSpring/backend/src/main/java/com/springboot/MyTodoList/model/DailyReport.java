package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DAILYREPORTS")
public class DailyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REPORT_ID")
    private Long reportId;

    @ManyToOne
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CONTENT", nullable = false, length = 300)
    private String content;

    @Column(name = "REPORT_DATE", nullable = false, insertable = false, updatable = false)
    private LocalDateTime reportDate;

    public DailyReport() {}

    public DailyReport(Project project, User user, String content) {
        this.project = project;
        this.user = user;
        this.content = content;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }

    @Override
    public String toString() {
        return "DailyReport{" +
                "reportId=" + reportId +
                ", reportDate=" + reportDate +
                '}';
    }
}
