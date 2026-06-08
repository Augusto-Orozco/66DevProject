package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Credential;
import com.springboot.MyTodoList.repository.CredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CredentialService {

    @Autowired
    private CredentialRepository credentialRepository;

    public Credential saveCredential(Credential credential) {
        return credentialRepository.save(credential);
    }

    public Optional<Credential> authenticate(String email, String password) {
        return credentialRepository.findByEmail(email)
                .filter(c -> c.getPassword().equals(password));
    }
}
