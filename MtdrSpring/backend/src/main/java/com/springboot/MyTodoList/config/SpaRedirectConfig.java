package com.springboot.MyTodoList.config;

import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.RequestDispatcher;
import org.springframework.http.ResponseEntity;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SpaRedirectConfig {

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> containerCustomizer() {
        return container -> {
            container.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/error-404"));
        };
    }

    @Controller
    public static class ErrorRedirectController {
        
        private static final List<String> API_PREFIXES = Arrays.asList(
            "/tasks", "/userTasks", "/taskUsers", "/userStory", "/sprints", 
            "/sprintTasks", "/priorities", "/statuses", "/userStories", 
            "/projects", "/login", "/users", "/adduser", "/updateUser", 
            "/deleteUser", "/diag", "/db-test", "/bot"
        );

        @RequestMapping("/error-404")
        public Object handle404(HttpServletRequest request) {
            String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
            if (path != null && (path.contains(".") || isApi(path))) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return "forward:/index.html";
        }

        private boolean isApi(String path) {
            return API_PREFIXES.stream().anyMatch(path::startsWith);
        }
    }
}
