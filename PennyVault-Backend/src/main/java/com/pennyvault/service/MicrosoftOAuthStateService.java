package com.pennyvault.service;

import com.pennyvault.entity.MicrosoftOAuthState;
import com.pennyvault.repository.MicrosoftOAuthStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthStateService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final int STATE_BYTE_LENGTH = 32;

    private static final int STATE_EXPIRY_MINUTES = 10;

    private final MicrosoftOAuthStateRepository stateRepository;

    @Transactional
    public String generateState() {

        byte[] randomBytes = new byte[STATE_BYTE_LENGTH];
        SECURE_RANDOM.nextBytes(randomBytes);

        String rawState = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        Instant now = Instant.now();

        String stateHash = hashState(rawState);

        // Remove expired records before storing a new state.
        stateRepository.deleteByExpiresAtBefore(now);

        MicrosoftOAuthState oauthState = MicrosoftOAuthState.builder()
                .stateHash(stateHash)
                .expiresAt(now.plus(STATE_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .createdAt(now)
                .build();

        stateRepository.save(oauthState);

        // Return the original state only to the OAuth flow.
        return rawState;
    }

    @Transactional
    public boolean validateAndConsumeState(String rawState) {

        if (rawState == null || rawState.isBlank()) {
            return false;
        }

        String stateHash = hashState(rawState);

        long deletedRecords =
                stateRepository.deleteByStateHashAndExpiresAtAfter(
                        stateHash,
                        Instant.now()
                );

        return deletedRecords == 1;
    }

    private String hashState(String rawState) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    rawState.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    exception
            );
        }
    }
}
