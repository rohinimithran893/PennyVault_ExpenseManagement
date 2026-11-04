package com.pennyvault.service;

import com.pennyvault.config.MicrosoftGraphProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MicrosoftTokenEncryptionServiceTest {

    private MicrosoftGraphProperties graphProperties;
    private MicrosoftTokenEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        graphProperties = mock(MicrosoftGraphProperties.class);
        when(graphProperties.encryptionKey()).thenReturn(
                Base64.getEncoder().encodeToString(new byte[32])
        );
        encryptionService = new MicrosoftTokenEncryptionService(graphProperties);
    }

    @Test
    void encryptAndDecryptReturnsOriginalRefreshToken() {
        String refreshToken = "sensitive-refresh-token";

        MicrosoftTokenEncryptionService.EncryptedToken encrypted =
                encryptionService.encrypt(refreshToken);

        assertNotEquals(refreshToken, encrypted.ciphertext());
        assertNotEquals(refreshToken, encrypted.initializationVector());
        assertEquals(
                refreshToken,
                encryptionService.decrypt(
                        encrypted.ciphertext(),
                        encrypted.initializationVector()
                )
        );
    }

    @Test
    void encryptUsesUniqueInitializationVectorForEachOperation() {
        MicrosoftTokenEncryptionService.EncryptedToken first =
                encryptionService.encrypt("same-refresh-token");
        MicrosoftTokenEncryptionService.EncryptedToken second =
                encryptionService.encrypt("same-refresh-token");

        assertNotEquals(first.initializationVector(), second.initializationVector());
        assertNotEquals(first.ciphertext(), second.ciphertext());
    }

    @Test
    void decryptRejectsTamperedCipherText() {
        MicrosoftTokenEncryptionService.EncryptedToken encrypted =
                encryptionService.encrypt("sensitive-refresh-token");

        String tampered = encrypted.ciphertext().substring(
                0, encrypted.ciphertext().length() - 4
        ) + "AAAA";

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.decrypt(
                        tampered,
                        encrypted.initializationVector()
                )
        );
    }

    @Test
    void encryptRequiresConfiguredThirtyTwoByteKey() {
        when(graphProperties.encryptionKey()).thenReturn("");

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.encrypt("sensitive-refresh-token")
        );
    }

    @Test
    void encryptRejectsIncorrectKeyLength() {
        when(graphProperties.encryptionKey()).thenReturn(
                Base64.getEncoder().encodeToString(new byte[16])
        );

        assertThrows(
                IllegalStateException.class,
                () -> encryptionService.encrypt("sensitive-refresh-token")
        );
    }
}
