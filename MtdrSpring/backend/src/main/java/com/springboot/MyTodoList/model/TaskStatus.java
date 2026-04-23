package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TASK_STATUS")
public class TaskStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STATUS_ID")
    private Long statusId;

    @Column(name = "STATUS", nullable = false, length = 50)
    private String status;
  
    public TaskStatus() {
    }

    public TaskStatus(String status) {
        this.status = status;
    }

    public TaskStatus(Long statusId, String status) {
        this.statusId = statusId;
        this.status = status;
    }

    public Long getStatusId() {
        return statusId;
    }

    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "TaskStatus{" +
                "statusId=" + statusId +
                ", status='" + status + '\'' +
                '}';
    }
}
