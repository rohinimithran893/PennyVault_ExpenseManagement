package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import com.pennyvault.entity.MicrosoftOAuthCredential;
import com.pennyvault.repository.MicrosoftOAuthCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthCredentialService {

    private final MicrosoftOAuthCredentialRepository credentialRepository;
    private final MicrosoftTokenEncryptionService encryptionService;
    private final MicrosoftGraphProperties graphProperties;

    @Transactional
    public void storeRefreshToken(String refreshToken) {
        String mailboxEmail = graphProperties.senderEmail();

        if (mailboxEmail == null || mailboxEmail.isBlank()) {
            throw new IllegalStateException(
                    "MICROSOFT_GRAPH_SENDER_EMAIL must be configured before connecting the mailbox."
            );
        }

        MicrosoftTokenEncryptionService.EncryptedToken encrypted =
                encryptionService.encrypt(refreshToken);

        Instant now = Instant.now();

        MicrosoftOAuthCredential credential = credentialRepository
                .findById(mailboxEmail.trim())
                .orElseGet(() -> MicrosoftOAuthCredential.builder()
                        .mailboxEmail(mailboxEmail.trim())
                        .createdAt(now)
                        .build());

        credential.setEncryptedRefreshToken(encrypted.ciphertext());
        credential.setInitializationVector(encrypted.initializationVector());
        credential.setUpdatedAt(now);

        credentialRepository.save(credential);
    }

    @Transactional(readOnly = true)
    public String getRefreshToken() {
        String mailboxEmail = graphProperties.senderEmail();

        if (mailboxEmail == null || mailboxEmail.isBlank()) {
            throw new IllegalStateException(
                    "MICROSOFT_GRAPH_SENDER_EMAIL must be configured."
            );
        }

        MicrosoftOAuthCredential credential = credentialRepository
                .findById(mailboxEmail.trim())
                .orElseThrow(() -> new IllegalStateException(
                        "Microsoft mailbox has not been connected yet."
                ));

        return encryptionService.decrypt(
                credential.getEncryptedRefreshToken(),
                credential.getInitializationVector()
        );
    }
}
