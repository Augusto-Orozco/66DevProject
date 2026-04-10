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

    public List<Credential> getAllCredentials() {
        return credentialRepository.findAll();
    }

    public Optional<Credential> getCredentialById(Long id) {
        return credentialRepository.findById(id);
    }

    public void deleteCredential(Long id) {
        credentialRepository.deleteById(id);
    }
}
