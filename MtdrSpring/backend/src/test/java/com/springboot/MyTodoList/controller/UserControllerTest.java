package com.springboot.MyTodoList.controller;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.springboot.MyTodoList.model.Credential;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.model.Role;
import com.springboot.MyTodoList.service.CredentialService;
import com.springboot.MyTodoList.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(value = UserController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private CredentialService credentialService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLoginSuccess() throws Exception {
        // Arrange
        Credential loginRequest = new Credential();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        User user = new User();
        user.setUserId(1L);
        user.setFirtsName("Test");
        user.setLastName("User");
        Credential cred = new Credential();
        cred.setEmail("test@example.com");
        user.setCredential(cred);
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("Admin");
        user.setRole(role);

        when(credentialService.authenticate(anyString(), anyString())).thenReturn(Optional.of(cred));
        when(userService.getUserByEmail(anyString())).thenReturn(Optional.of(user));

        // Act & Assert
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.roleName").value("Admin"));
    }

    @Test
    void testLoginUnauthorized() throws Exception {
        // Arrange
        Credential loginRequest = new Credential();
        loginRequest.setEmail("wrong@example.com");
        loginRequest.setPassword("wrong");

        when(credentialService.authenticate(anyString(), anyString())).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
