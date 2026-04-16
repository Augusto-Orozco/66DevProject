package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "ROLE_ID", nullable = false)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "CREDENTIAL_ID", nullable = false)
    private Credential credential;

    @Column(name = "TELEGRAM_ID", nullable = false, unique = true)
    private Long telegramId;

    @Column(name = "PHONE", nullable = false, length = 20)
    private String phone;

    @Column(name = "FIRTS_NAME", nullable = false, length = 50)
    private String firtsName; // Matching the typo in SQL: FIRTS_NAME

    @Column(name = "LAST_NAME", nullable = false, length = 50)
    private String lastName;

    public User() {}

    public User(Role role, Credential credential, Long telegramId, String phone, String firtsName, String lastName) {
        this.role = role;
        this.credential = credential;
        this.telegramId = telegramId;
        this.phone = phone;
        this.firtsName = firtsName;
        this.lastName = lastName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Credential getCredential() {
        return credential;
    }

    public void setCredential(Credential credential) {
        this.credential = credential;
    }

    public Long getTelegramId() {
        return telegramId;
    }

    public void setTelegramId(Long telegramId) {
        this.telegramId = telegramId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFirtsName() {
        return firtsName;
    }

    public void setFirtsName(String firtsName) {
        this.firtsName = firtsName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", telegramId=" + telegramId +
                ", firtsName='" + firtsName + '\'' +
                ", lastName='" + lastName + '\'' +
                '}';
    }
}
