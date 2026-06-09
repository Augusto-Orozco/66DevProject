package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Credential;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.CredentialService;
import com.springboot.MyTodoList.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private CredentialService credentialService;

    @PostMapping(value = "/login")
    public ResponseEntity<?> login(@RequestBody Credential loginRequest) {
        Optional<Credential> credentialOpt =
                credentialService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (credentialOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userService.getUserByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("email", user.getCredential().getEmail());
        response.put("roleId", user.getRole().getRoleId());
        response.put("roleName", user.getRole().getRoleName());
        response.put("firstName", user.getFirtsName());
        response.put("lastName", user.getLastName());

        return ResponseEntity.ok(response);
    }
}
