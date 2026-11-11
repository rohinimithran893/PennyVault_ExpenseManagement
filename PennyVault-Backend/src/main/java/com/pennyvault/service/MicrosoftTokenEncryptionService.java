package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class MicrosoftTokenEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_LENGTH_BYTES = 32;
    private static final int IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final MicrosoftGraphProperties graphProperties;

    public EncryptedToken encrypt(String plainTextToken) {
        if (plainTextToken == null || plainTextToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token must not be blank.");
        }

        byte[] key = encryptionKey();
        byte[] iv = new byte[IV_LENGTH_BYTES];
        new java.security.SecureRandom().nextBytes(iv);

        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
            );

            byte[] encrypted = cipher.doFinal(
                    plainTextToken.getBytes(StandardCharsets.UTF_8)
            );

            return new EncryptedToken(
                    Base64.getEncoder().encodeToString(encrypted),
                    Base64.getEncoder().encodeToString(iv)
            );
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Could not encrypt Microsoft refresh token.", exception);
        }
    }

    public String decrypt(String encryptedToken, String encodedIv) {
        if (encryptedToken == null || encryptedToken.isBlank()
                || encodedIv == null || encodedIv.isBlank()) {
            throw new IllegalArgumentException("Encrypted token and IV are required.");
        }

        try {
            byte[] cipherText = Base64.getDecoder().decode(encryptedToken);
            byte[] iv = Base64.getDecoder().decode(encodedIv);

            if (iv.length != IV_LENGTH_BYTES) {
                throw new IllegalArgumentException("Invalid Microsoft token initialization vector.");
            }

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    new SecretKeySpec(encryptionKey(), "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
            );

            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("Could not decrypt Microsoft refresh token.", exception);
        }
    }

    private byte[] encryptionKey() {
        String configuredKey = graphProperties.encryptionKey();

        if (configuredKey == null || configuredKey.isBlank()) {
            throw new IllegalStateException(
                    "MICROSOFT_GRAPH_ENCRYPTION_KEY must be configured."
            );
        }

        try {
            byte[] key = Base64.getDecoder().decode(configuredKey.trim());
            if (key.length != KEY_LENGTH_BYTES) {
                throw new IllegalStateException(
                        "MICROSOFT_GRAPH_ENCRYPTION_KEY must decode to exactly 32 bytes."
                );
            }
            return key;
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "MICROSOFT_GRAPH_ENCRYPTION_KEY must be a valid Base64-encoded 32-byte key.",
                    exception
            );
        }
    }

    public record EncryptedToken(String ciphertext, String initializationVector) {
    }
}
