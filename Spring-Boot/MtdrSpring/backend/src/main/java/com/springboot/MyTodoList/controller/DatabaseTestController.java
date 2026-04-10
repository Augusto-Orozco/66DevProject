package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.*;
import com.springboot.MyTodoList.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DatabaseTestController {

    @Autowired private UserService userService;
    @Autowired private RoleService roleService;
    @Autowired private CredentialService credentialService;

    @GetMapping("/test-db")
    public Map<String, Object> testDatabase() {
        Map<String, Object> results = new HashMap<>();
        try {
            // 1. Create Role (Required for User)
            Role role = new Role();
            role.setRoleName("TEST_ROLE_" + System.currentTimeMillis());
            role = roleService.saveRole(role);
            results.put("step1_role", "Created: " + role.getRoleName());

            // 2. Create Credential (Required for User)
            Credential cred = new Credential();
            cred.setEmail("test_" + System.currentTimeMillis() + "@test.com");
            cred.setPassword("test_hash");
            cred = credentialService.saveCredential(cred);
            results.put("step2_credential", "Created: " + cred.getEmail());

            // 3. Create User
            User user = new User();
            user.setRole(role);
            user.setCredential(cred);
            user.setTelegramId(System.currentTimeMillis());
            user.setPhone("123456789");
            user.setFirtsName("TestName"); // Using 'firtsName' from your model typo
            user.setLastName("TestLastName");
            
            user = userService.saveUser(user);
            results.put("step3_user_creation", "Success: User ID " + user.getUserId());

            // 4. Update User
            user.setFirtsName("UpdatedTestName");
            user = userService.saveUser(user);
            results.put("step4_user_update", "Success: New Name " + user.getFirtsName());

            // 5. Read User
            User readUser = userService.getUserById(user.getUserId()).orElse(null);
            results.put("step5_user_read", "Success: Read back " + (readUser != null ? readUser.getFirtsName() : "NULL"));

        } catch (Exception e) {
            results.put("error", e.getMessage());
            e.printStackTrace();
        }
        return results;
    }
}
