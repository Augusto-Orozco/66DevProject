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

    @GetMapping(value = "/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping(value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> userById = userService.getUserById(id);
        if (userById.isPresent()) {
            return new ResponseEntity<>(userById.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(value = "/adduser")
    public ResponseEntity<User> addUser(@RequestBody User newUser) {
        User dbUser = userService.saveUser(newUser);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + dbUser.getUserId());
        responseHeaders.set("Access-Control-Expose-Headers", "location");

        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(dbUser);
    }

    @PutMapping(value = "/updateUser/{id}")
    public ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable Long id) {
        Optional<User> dbUserOpt = userService.getUserById(id);
        if (dbUserOpt.isPresent()) {
            user.setUserId(id);
            User updatedUser = userService.saveUser(user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping(value = "/deleteUser/{id}")
    public ResponseEntity<Boolean> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>(true, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
}
