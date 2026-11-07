package com.pennyvault.repository;

import com.pennyvault.entity.MicrosoftOAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MicrosoftOAuthCredentialRepository
        extends JpaRepository<MicrosoftOAuthCredential, String> {
}
