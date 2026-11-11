package com.pennyvault.repository;

import com.pennyvault.entity.MicrosoftOAuthState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface MicrosoftOAuthStateRepository
        extends JpaRepository<MicrosoftOAuthState, String> {

    long deleteByExpiresAtBefore(Instant currentTime);

    long deleteByStateHashAndExpiresAtAfter(
            String stateHash,
            Instant currentTime
    );
}
