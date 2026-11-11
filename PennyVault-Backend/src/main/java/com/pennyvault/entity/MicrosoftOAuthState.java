package com.pennyvault.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "microsoft_oauth_states")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MicrosoftOAuthState {

    @Id
    @Column(name = "state_hash", nullable = false, length = 64)
    private String stateHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
