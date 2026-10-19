package com.pennyvault.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private static String encodedKey(byte value) {
        byte[] key = new byte[32];
        java.util.Arrays.fill(key, value);
        return Base64.getEncoder().encodeToString(key);
    }

    @Test
    void generatedTokenCanBeVerifiedWithConfiguredKey() {
        JwtService jwtService = new JwtService(encodedKey((byte) 1), 86_400_000L);

        String token = jwtService.generateToken("user@example.com");

        assertEquals("user@example.com", jwtService.extractEmail(token));
    }

    @Test
    void tokenSignedWithPreviousKeyIsRejectedAfterRotation() {
        JwtService oldService = new JwtService(encodedKey((byte) 1), 86_400_000L);
        JwtService newService = new JwtService(encodedKey((byte) 2), 86_400_000L);
        String token = oldService.generateToken("user@example.com");

        assertThrows(JwtException.class, () -> newService.extractEmail(token));
    }

    @Test
    void rejectsKeyShorterThanHs256Minimum() {
        String shortKey = Base64.getEncoder().encodeToString(new byte[16]);

        assertThrows(IllegalStateException.class,
                () -> new JwtService(shortKey, 86_400_000L));
    }

    @Test
    void rejectsNonPositiveExpiration() {
        assertThrows(IllegalStateException.class,
                () -> new JwtService(encodedKey((byte) 1), 0));
    }
}
